const { response } = require('../helpers/response.formatter');

const { User, Token, Role, Company, UserProfile, Userpermission, Permission, sequelize } = require('../models');
const baseConfig = require('../config/base.config');
const passwordHash = require('password-hash');
const jwt = require('jsonwebtoken');
const { generatePagination } = require('../pagination/pagination');
const Validator = require("fastest-validator");
const v = new Validator();
const { Op, where } = require('sequelize');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const logger = require('../errorHandler/logger');
const { default: slugify } = require('slugify');
const { name } = require('ejs');
const { json } = require('body-parser');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_NAME,
        pass: process.env.EMAIL_PW,
    }
});

module.exports = {

    //membuat user baru
    createUser: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            // Membuat schema untuk validasi
            const schema = {
                name: { type: "string", min: 3 },
                email: { type: "string", min: 5, max: 50, pattern: /^\S+@\S+\.\S+$/, optional: true },
                password: { type: "string", min: 5, max: 16 },
                role_id: { type: "number", optional: true }
            };

            // Validasi
            const validate = v.validate({
                name: req.body.name,
                password: req.body.password,
                role_id: req.body.role_id !== undefined ? Number(req.body.role_id) : undefined,
                email: req.body.email,
            }, schema);

            if (validate.length > 0) {
                // Format pesan error dalam bahasa Indonesia
                const errorMessages = validate.map(error => {
                    if (error.type === 'stringMin') {
                        return `${error.field} minimal ${error.expected} karakter`;
                    } else if (error.type === 'stringMax') {
                        return `${error.field} maksimal ${error.expected} karakter`;
                    } else if (error.type === 'stringPattern') {
                        return `${error.field} format tidak valid`;
                    } else {
                        return `${error.field} tidak valid`;
                    }
                });

                res.status(400).json({
                    status: 400,
                    message: errorMessages.join(', ')
                });
                return;
            }

            let userCreateObj = {
                email: req.body.email,
                password: passwordHash.generate(req.body.password),
                role_id: req.body.role_id !== undefined ? Number(req.body.role_id) : 2
            };

            // Membuat user baru
            let user = await User.create(userCreateObj);

            // Membuat object untuk create userProfileObj
            let userProfileObj = {
                name: req.body.name,
                user_id: user.id,
                slug: user.slug
            };

            // Membuat entri baru di tabel userProfileObj
            let userProfile = await UserProfile.create(userProfileObj);

            // Mengirim response dengan bantuan helper response.formatter
            await transaction.commit();
            const userData = {
                id: user.id,
                name: userProfile.name,
                email: user.email,
                role_id: user.role_id,
            }
            res.status(201).json(response(201, 'user created', userData));

        } catch (err) {
            await transaction.rollback();
            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            if (err.name === 'SequelizeUniqueConstraintError') {
                // Menangani error khusus untuk constraint unik
                res.status(400).json({
                    status: 400,
                    message: `${err.errors[0].path} sudah terdaftar`
                });
            } else {
                // Menangani error lainnya
                res.status(500).json(response(500, 'terjadi kesalahan pada server', err));
            }
            console.log(err);
        }
    },

    adminCreateUser: async (req, res) => {
        try {
            const userExist = await User.findOne({ where: { email: req.body.email } });
            if (userExist) return res.status(400).json(response(400, 'user already exist'));

            const role = await Role.findOne({ where: { name: 'User' } });
            if (!role) return res.status(404).json(response(404, 'role not found'));

            const schema = {
                name: { type: "string", min: 3 },
                email: { type: "string", min: 5, max: 50, pattern: /^\S+@\S+\.\S+$/, optional: true },
                password: { type: "string", min: 5, max: 16 },
                role_id: { type: "number", optional: true }
            };

            const obj = {
                name: req.body.name,
                password: req.body.password,
                role_id: role.id,
                email: req.body.email,
            };

            const validate = v.validate(obj, schema);

            if (validate.length > 0) {
                const errorMessages = validate.map(error => {
                    if (error.type === 'stringMin') {
                        return `${error.field} minimal ${error.expected} karakter`;
                    } else if (error.type === 'stringMax') {
                        return `${error.field} maksimal ${error.expected} karakter`;
                    } else if (error.type === 'stringPattern') {
                        return `${error.field} format tidak valid`;
                    } else {
                        return `${error.field} tidak valid`;
                    }
                });
                res.status(400).json({
                    status: 400,
                    message: errorMessages.join(', ')
                });
                return;
            }
            obj.password = passwordHash.generate(obj.password);

            let user = await User.create(obj);
            if (user) {
                user.profile = await UserProfile.create({ name: obj.name, user_id: user.id, slug: obj.slug });
            };

            const userResponse = {
                id: user.id,
                email: user.email,
                name: user.profile.name,
                slug: user.slug,
                role_id: user.role_id,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };

            res.status(201).json(response(201, 'user created', userResponse));
        } catch (err) {
            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //login user
    loginUser: async (req, res) => {
        try {
            const schema = {
                email: {
                    type: "string",
                    min: 3,
                },
                password: {
                    type: "string",
                    min: 3,
                }
            };

            let email = req.body.email;
            let password = req.body.password;

            // Validasi input
            const validate = v.validate({
                email: email,
                password: password,
            }, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            // Mencari data user berdasarkan email
            let whereClause = {
                [Op.or]: [
                    { email: email }
                ]
            };

            const adminCondition = {};
            adminCondition.deletedAt = null;
            whereClause.deletedAt = null;

            let user = await User.scope('withPassword').findOne({
                where: { email: email, deletedAt: null },
                include: [
                    {
                        model: Role,
                        attributes: ['name', 'id'],
                        include: [
                            {
                                model: Permission,
                                attributes: ['name', 'id'],
                            }
                        ],
                        as: 'Role'
                    },
                    {
                        model: UserProfile,
                        as: 'UserProfile',
                        attributes: ['name', 'id', 'user_id', 'nik', 'phoneNumber'],
                    },
                    {
                        model: Company,
                    }
                ]
            });

            console.log(user);

            // cek apakah user ditemukan
            if (!user) {
                res.status(404).json(response(404, 'User not found'));
                return;
            }

            // check password
            if (!passwordHash.verify(password, user.password)) {
                res.status(403).json(response(403, 'password wrong'));
                return;
            }

            // membuat token jwt
            let token = jwt.sign({
                userId: user.id,
                email: user.email,
                name: user.UserProfile?.name ?? user.Company?.name,
                roleId: user.role_id,
                role: user.Role.name,
            }, baseConfig.auth_secret, {
                expiresIn: 864000 // time expired 
            });
            const permissions = user.Role.Permissions.map(permission => permission.name);

            // get permission
            res.status(200).json(response(200, 'login success', { token: token, permission: permissions }));

        } catch (err) {

            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //logout user
    logoutUser: async (req, res) => {
        try {
            //memasukan token kedalam variable
            let token = req.headers.authorization.split(' ')[1];

            //memasukan token ke table token
            let tokenInsert = await Token.create({
                token: token
            });

            //send response
            res.status(200).json(response(200, 'logout success', tokenInsert));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua data user
    getuser: async (req, res) => {
        try {
            let { search, status } = req.query;
            const showDeleted = req.query.showDeleted ?? null;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let userGets;
            let totalCount;

            const whereCondition = {};
            const whereSearch = {};

            if (search) {
                whereSearch[Op.or] = [{ name: { [Op.iLike]: `%${search}%` } }, { nik: { [Op.iLike]: `%${search}%` } }];
            }
            if (status) {
                whereCondition.isActive = status === 'active' ? 'true' : 'false';
            }

            if (showDeleted !== null) {
                whereCondition.deletedAt = { [Op.not]: null };
            } else {
                whereCondition.deletedAt = null;
            }

            [userGets, totalCount] = await Promise.all([
                User.findAll({
                    include: [
                        {
                            model: Role,
                            attributes: ['name', 'id'],
                            as: 'Role',
                            where: { name: 'User' }
                        },
                        {
                            model: UserProfile,
                            as: 'UserProfile',
                            where: whereSearch
                        },
                    ],
                    limit: limit,
                    offset: offset,
                    attributes: { exclude: ['Role', 'UserProfile'] },
                    order: [['id', 'ASC']],
                    where: whereCondition,
                }),
                User.count({
                    where: whereCondition
                })
            ]);

            let formattedUsers = userGets.map(user => {
                return {
                    id: user.id,
                    slug: user.UserProfile?.slug,
                    name: user.UserProfile?.name,
                    nik: user.UserProfile?.nik,
                    email: user.email,
                    phone: user.UserProfile?.phoneNumber,
                    isActive: user.isActive,
                    role_id: user.Role?.id,
                    role_name: user.Role?.name,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                };
            });

            const pagination = generatePagination(totalCount, page, limit, '/api/users/get');

            res.status(200).json({
                status: 200,
                message: 'success get',
                data: formattedUsers,
                pagination: pagination
            });

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    getCompany: async (req, res) => {
        try {
            let { search, status } = req.query;
            const showDeleted = req.query.showDeleted ?? null;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let userGets;
            let totalCount;

            const whereCondition = {};
            const whereSearch = {};
            if (search) {
                whereSearch[Op.or] = [{ name: { [Op.iLike]: `%${search}%` } }, { department: { [Op.iLike]: `%${search}%` } }];
            }
            if (status) {
                whereCondition.isActive = status === 'active' ? 'true' : 'false';
            }

            if (showDeleted !== null) {
                whereCondition.deletedAt = { [Op.not]: null };
            } else {
                whereCondition.deletedAt = null;
            }

            [userGets, totalCount] = await Promise.all([
                User.findAll({
                    include: [
                        {
                            model: Role,
                            attributes: ['name', 'id'],
                            as: 'Role',
                            where: { name: 'Company' }
                        },
                        {
                            model: Company,
                            where: whereSearch
                        },
                    ],
                    limit: limit,
                    offset: offset,
                    order: [['id', 'ASC']],
                    where: whereCondition,
                }),
                User.count({
                    where: whereCondition
                })
            ]);

            let formattedUsers = userGets.map(user => {
                return {
                    id: user.id,
                    slug: user.slug,
                    name: user.Company?.name,
                    department: user.Company?.department,
                    email: user.email,
                    numberEmployee: user.Company?.numberEmployee,
                    isActive: user.isActive,
                    role_id: user.Role?.id,
                    role_name: user.Role?.name,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                };
            });

            const pagination = generatePagination(totalCount, page, limit, '/api/get');

            res.status(200).json({
                status: 200,
                message: 'success get',
                data: formattedUsers,
                pagination: pagination
            });

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    getDetailCompany: async (req, res) => {
        try {
            const user = await User.findOne({ where: { id: req.params.id } });
            if (!user) {
                return res.status(404).json(response(404, 'user not found'));
            }
            let company = await Company.findOne({ where: { user_id: user.id } });

            if (!company) {
                return res.status(404).json(response(404, 'company not found'));
            }
            company = { ...company.dataValues, email:user.email };

            res.status(200).json(response(200, 'success get company', company));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data user berdasarkan slug
    getuserByslug: async (req, res) => {
        try {
            const showDeleted = req.query.showDeleted ?? null;
            const whereCondition = { slug: req.params.slug };

            if (showDeleted !== null) {
                whereCondition.deletedAt = { [Op.not]: null };
            } else {
                whereCondition.deletedAt = null;
            }

            let userGet = await User.findOne({
                where: whereCondition,
                include: [
                    {
                        model: Role,
                        attributes: ['name', 'id'],
                        as: 'Role'
                    },
                    {
                        model: UserProfile,
                        as: 'UserProfile'
                    },
                ],
                attributes: { exclude: ['Role', 'UserProfile'] }
            });

            //cek jika user tidak ada
            if (!userGet) {
                res.status(404).json(response(404, 'user not found'));
                return;
            }

            let formattedUsers = {
                id: userGet.id,
                name: userGet.UserProfile?.name,
                nik: userGet.UserProfile?.nik,
                role_id: userGet.Role?.id,
                role_name: userGet.Role?.name,
                createdAt: userGet.createdAt,
                updatedAt: userGet.updatedAt
            };

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get user by id', formattedUsers));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },
    getforuser: async (req, res) => {
        try {
            const showDeleted = req.query.showDeleted ?? null;
            const whereCondition = { id: data.user_akun_id };

            if (showDeleted !== null) {
                whereCondition.deletedAt = { [Op.not]: null };
            } else {
                whereCondition.deletedAt = null;
            }

            let userGet = await User.findOne({
                where: whereCondition,
                include: [
                    {
                        model: Role,
                        attributes: ['name', 'id'],
                        as: 'Role'
                    },
                    {
                        model: UserProfile,
                        as: 'UserProfile',
                    },
                ],
                attributes: { exclude: ['Role', 'UserProfile'] }
            });

            //cek jika user tidak ada
            if (!userGet) {
                res.status(404).json(response(404, 'user not found'));
                return;
            }

            let formattedUsers = {
                id: userGet.id,
                name: userGet.UserProfile?.name,
                slug: userGet.UserProfile?.slug,
                nik: userGet.UserProfile?.nik,
                email: userGet.UserProfile?.email,
                telepon: userGet.UserProfile?.telepon,
                alamat: userGet.UserProfile?.alamat,
                agama: userGet.UserProfile?.agama,
                tempat_lahir: userGet.UserProfile?.tempat_lahir,
                tgl_lahir: userGet.UserProfile?.tgl_lahir,
                status_kawin: userGet.UserProfile?.status_kawin,
                gender: userGet.UserProfile?.gender,
                pekerjaan: userGet.UserProfile?.pekerjaan,
                goldar: userGet.UserProfile?.goldar,
                pendidikan: userGet.UserProfile?.pendidikan,
                foto: userGet.UserProfile?.foto,
                role_id: userGet.Role?.id,
                role_name: userGet.Role?.name,
                createdAt: userGet.createdAt,
                updatedAt: userGet.updatedAt
            };

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get user by id', formattedUsers));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //menghapus user berdasarkan slug
    deleteuser: async (req, res) => {

        try {

            //mendapatkan data user untuk pengecekan
            let userGet = await User.findOne({
                where: {
                    slug: req.params.slug,
                    deletedAt: null
                }
            })

            //cek apakah data user ada
            if (!userGet) {
                res.status(404).json(response(404, 'user not found'));
                return;
            }

            await User.update({ deletedAt: new Date() }, {
                where: {
                    slug: req.params.slug
                }
            });

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success delete user'));

        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    updateStatusAccount: async (req, res) => {
        try {
            const user = User.findOne({ where: { slug: req.params.slug } });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            await User.update({ isActive: req.body.status }, { where: { slug: req.params.slug } });
            res.status(200).json({ status: 200, message: 'User status updated successfully' });
        } catch (error) {
            logger.error(`Error: ${error}`);
            logger.error(`Error: ${error.message}`);
            res.status(500).json(response(500, 'Internal server error', error));
        }
    },

    changePassword: async (req, res) => {
        const slug = req.params.slug;
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: 'Semua kolom wajib diisi.' });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: 'Kata sandi baru tidak cocok.' });
        }

        try {
            const user = await User.scope('withPassword').findOne({ where: { slug } });
            if (!user) {
                return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
            }

            if (!passwordHash.verify(oldPassword, user.password)) {
                return res.status(400).json({ message: 'Kata sandi lama salah.' });
            }

            user.password = passwordHash.generate(newPassword);
            await user.save();

            return res.status(200).json({ message: 'Password has been updated.' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    },

    changePasswordFromAdmin: async (req, res) => {
        const slug = req.params.slug;
        const { newPassword, confirmNewPassword } = req.body;

        if (!newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: 'Semua kolom wajib diisi.' });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: 'Kata sandi baru tidak cocok.' });
        }

        try {
            const user = await User.findOne({ where: { slug } });
            if (!user) {
                return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
            }

            user.password = passwordHash.generate(newPassword);
            await user.save();

            return res.status(200).json({ message: 'Password has been updated.' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    },

    forgotPassword: async (req, res) => {
        const { email } = req.body;

        try {
            const user = await User.findOne({
                include: [
                    {
                        model: UserProfile,
                        attributes: ['email'],
                        where: { email },
                    }
                ]
            },);

            if (!user) {
                return res.status(404).json({ message: 'Email tidak terdaftar.' });
            }

            const token = crypto.randomBytes(20).toString('hex');
            const resetpasswordexpires = Date.now() + 3600000;

            user.resetpasswordtoken = token;
            user.resetpasswordexpires = resetpasswordexpires;

            await user.save();

            const mailOptions = {
                to: user?.UserProfile?.email,
                from: process.env.EMAIL_NAME,
                subject: 'Password Reset',
                text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                Please click on the following link, or paste this into your browser to complete the process:\n\n
                ${process.env.WEBSITE_URL}new-password/${token}\n\n
                If you did not request this, please ignore this email and your password will remain unchanged.\n`
            };

            transporter.sendMail(mailOptions, (err) => {
                if (err) {
                    console.error('There was an error: ', err);
                    return res.status(500).json({ message: `${process.env.EMAIL_NAME} ${process.env.EMAIL_PW}Error sending the email.  ${err}` });
                }
                res.status(200).json({ message: 'Email telah dikirim ke dengan instruksi lebih lanjut.' });
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    },

    resetPassword: async (req, res) => {
        const { token } = req.params;
        const { newPassword, confirmNewPassword } = req.body;

        if (!newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: 'Semua kolom wajib diisi.' });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: 'Kata sandi baru tidak cocok.' });
        }

        try {
            const user = await User.findOne({
                where: {
                    resetpasswordtoken: token,
                    resetpasswordexpires: { [Op.gt]: Date.now() }
                }
            });

            if (!user) {
                return res.status(400).json({ message: 'Token reset kata sandi tidak valid atau telah kedaluwarsa.' });
            }

            user.password = passwordHash.generate(newPassword);
            user.resetpasswordtoken = null;
            user.resetpasswordexpires = null;
            await user.save();

            return res.status(200).json({ message: 'Password berhasil diganti.' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    },

    getUserPermissions: async (req, res) => {
        const { userId } = req.params;

        try {
            // Find the user
            const user = await User.findByPk(userId, {
                include: {
                    model: Permission,
                    through: Userpermission,
                    as: 'permissions'
                }
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json(response(200, 'success get data', { permissions: user?.permissions }));
        } catch (error) {
            logger.error(`Error : ${error}`);
            logger.error(`Error message: ${error.message}`);
            console.error('Error fetching user permissions:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    updateUserpermissions: async (req, res) => {
        const { userId, permissions } = req.body;

        try {
            // Find the user
            const user = await User.findByPk(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Find all permission records that match the given permission names
            const permissionRecords = await Permission.findAll({
                where: {
                    id: permissions
                }
            });

            if (permissionRecords.length !== permissions.length) {
                return res.status(400).json({ message: 'Some permissions not found' });
            }

            // Get the ids of the found permissions
            const permissionIds = permissionRecords.map(permission => permission.id);

            // Remove old permissions
            await Userpermission.destroy({
                where: { user_id: userId }
            });

            // Add new permissions
            const userPermissions = permissionIds.map(permissionId => ({
                user_id: userId,
                permission_id: permissionId
            }));

            await Userpermission.bulkCreate(userPermissions);

            res.status(200).json({ message: 'Permissions updated successfully' });
        } catch (error) {
            logger.error(`Error : ${error}`);
            logger.error(`Error message: ${error.message}`);
            console.error('Error updating permissions:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}