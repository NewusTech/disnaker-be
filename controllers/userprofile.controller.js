const { response } = require('../helpers/response.formatter');

const { Application, Company, SavedVacancy, User, UserExperience, UserProfile, UserCertificate, UserEducationHistory, UserLink, Skill, Role, sequelize, UserOrganization, UserSkill } = require('../models');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const passwordHash = require('password-hash');
const Validator = require("fastest-validator");
const v = new Validator();
const { Op, where } = require('sequelize');
const { generatePagination } = require('../pagination/pagination');

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const logger = require('../errorHandler/logger');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    useAccelerateEndpoint: true
});

module.exports = {

    //mendapatkan semua data user
    getuserdata: async (req, res) => {
        try {
            const search = req.query.search ?? null;
            const role = req.query.role ?? null;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const showDeleted = req.query.showDeleted ?? null;
            const offset = (page - 1) * limit;
            let userGets;
            let totalCount;

            const userWhereClause = {};
            if (showDeleted !== null) {
                userWhereClause.deletedAt = { [Op.not]: null };
            } else {
                userWhereClause.deletedAt = null;
            }
            if (role) {
                userWhereClause.role_id = role;
            }

            if (search) {
                [userGets, totalCount] = await Promise.all([
                    UserProfile.findAll({
                        where: {
                            [Op.or]: [
                                { nik: { [Op.iLike]: `%${search}%` } },
                                { name: { [Op.iLike]: `%${search}%` } }
                            ]
                        },
                        include: [
                            {
                                model: User,
                                where: userWhereClause,
                                attributes: ['id'],
                                include: [
                                    {
                                        model: Role,
                                        attributes: ['id', 'name'],
                                    },
                                ],
                            },
                        ],
                        limit: limit,
                        offset: offset
                    }),
                    UserProfile.count({
                        where: {
                            [Op.or]: [
                                { nik: { [Op.iLike]: `%${search}%` } },
                                { name: { [Op.iLike]: `%${search}%` } }
                            ]
                        },
                        include: [
                            {
                                model: User,
                                where: userWhereClause,
                                attributes: ['id'],
                                include: [
                                    {
                                        model: Role,
                                        attributes: ['id', 'name'],
                                    },
                                ],
                            },
                        ],
                    })
                ]);
            } else {
                [userGets, totalCount] = await Promise.all([
                    UserProfile.findAll({
                        limit: limit,
                        offset: offset,
                        include: [
                            {
                                model: User,
                                where: userWhereClause,
                                attributes: ['id'],
                                include: [
                                    {
                                        model: Role,
                                        attributes: ['id', 'name'],
                                    },
                                ],
                            },
                        ],
                    }),
                    UserProfile.count({
                        include: [
                            {
                                model: User,
                                where: userWhereClause,
                                attributes: ['id'],
                                include: [
                                    {
                                        model: Role,
                                        attributes: ['id', 'name'],
                                    },
                                ],
                            },
                        ],
                    })
                ]);
            }

            const pagination = generatePagination(totalCount, page, limit, '/api/userprofile/get');

            const formattedData = userGets.map(user => {
                return {
                    id: user.id,
                    user_id: user?.User?.id,
                    name: user.name,
                    slug: user.slug,
                    nik: user.nik,
                    email: user.email,
                    telepon: user.telepon,
                    alamat: user.alamat,
                    agama: user.agama,
                    tempat_lahir: user.tempat_lahir,
                    tgl_lahir: user.tgl_lahir,
                    status_kawin: user.status_kawin,
                    gender: user.gender,
                    pekerjaan: user.pekerjaan,
                    goldar: user.goldar,
                    pendidikan: user.pendidikan,
                    foto: user.foto,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    Role: user.User.Role ? user.User.Role.name : null,
                };
            });

            res.status(200).json({
                status: 200,
                message: 'success get user',
                data: formattedData,
                pagination: pagination
            });

        } catch (err) {
            res.status(500).json({
                status: 500,
                message: 'internal server error',
                error: err
            });
            console.log(err);
        }
    },
    getUserProfile: async (req, res) => {
        try {
            let favoriteCount;
            let applicationCount;
            let user;
            [user, applicationCount, favoriteCount] = await Promise.all([
                await User.findOne({
                    where: { id: auth.userId },
                    attributes: ['id', 'email'],
                    include: [
                        { model: UserProfile },
                        { model: UserExperience },
                        { model: UserEducationHistory },
                        { model: UserOrganization },
                        { model: Skill },
                        { model: UserCertificate },
                        { model: UserLink },
                    ]
                }),
                Application.count({
                    where: { user_id: auth.userId }
                }),
                SavedVacancy.count({
                    where: { user_id: auth.userId }
                })
            ]);

            if (!user) {
                res.status(404).json(response(404, "UserProfile Not found"));
                return;
            }

            let userData = user.get({ plain: true });

            return res.status(200).json({
                status: 200,
                message: "success get user profile",
                data: {
                    ...userData,
                    favoriteCount,
                    applicationCount
                },
            });
        } catch (error) {
            logger.error(`Error : ${error}`);
            logger.error(`Error message: ${error.message}`);
            console.error('Error fetching user permissions:', error);
            res.status(500).json(response(500, 'internal server error', error));
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

            let userGet = await UserProfile.findOne({
                where: whereCondition,
                include: [
                    {
                        model: User,
                        attributes: ['id'],
                    }
                ]
            });

            if (!userGet) {
                res.status(404).json(response(404, 'user data not found'));
                return;
            }

            res.status(200).json(response(200, 'success get user by slug', userGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },
    //create data
    createuserprofile: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {

            // Membuat schema untuk validasi
            const schema = {
                name: { type: "string", min: 2 },
                nik: { type: "string", length: 16 },
                email: { type: "string", min: 5, max: 50, pattern: /^\S+@\S+\.\S+$/, optional: true },
                telepon: { type: "string", min: 7, max: 15, pattern: /^[0-9]+$/, optional: true },
                alamat: { type: "string", min: 3, optional: true },
                agama: { type: "number", optional: true },
                tempat_lahir: { type: "string", min: 2, optional: true },
                tgl_lahir: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, optional: true },
                status_kawin: { type: "number", optional: true },
                gender: { type: "number", optional: true },
                pekerjaan: { type: "string", optional: true },
                goldar: { type: "number", optional: true },
                pendidikan: { type: "number", optional: true },
            }

            const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
            const slug = `${req.body.name}-${timestamp}`;

            // Buat object userprofile
            let userprofileObj = {
                name: req.body.name,
                nik: req.body.nik,
                email: req.body.email,
                telepon: req.body.telepon,
                alamat: req.body.alamat,
                agama: req.body.agama ? Number(req.body.agama) : null,
                tempat_lahir: req.body.tempat_lahir,
                tgl_lahir: req.body.tgl_lahir,
                status_kawin: req.body.status_kawin ? Number(req.body.status_kawin) : null,
                gender: req.body.gender ? Number(req.body.gender) : null,
                pekerjaan: req.body.pekerjaan,
                goldar: req.body.goldar ? Number(req.body.goldar) : null,
                pendidikan: req.body.pendidikan ? Number(req.body.pendidikan) : null,
                slug: slug
            };

            // Validasi menggunakan module fastest-validator
            const validate = v.validate(userprofileObj, schema);
            if (validate.length > 0) {
                // Format pesan error dalam bahasa Indonesia
                const errorMessages = validate.map(error => {
                    if (error.type === 'stringMin') {
                        return `Field ${error.field} minimal ${error.expected} karakter`;
                    } else if (error.type === 'stringMax') {
                        return `Field ${error.field} maksimal ${error.expected} karakter`;
                    } else if (error.type === 'stringPattern') {
                        return `Field ${error.field} format tidak valid`;
                    } else {
                        return `Field ${error.field} tidak valid`;
                    }
                });

                res.status(400).json({
                    status: 400,
                    message: errorMessages.join(', ')
                });
                return;
            }

            // Update userprofile
            let userprofileCreate = await UserProfile.create(userprofileObj)

            const firstName = req.body.name.split(' ')[0].toLowerCase();
            const generatedPassword = firstName + "123";

            // Membuat object untuk create user
            let userCreateObj = {
                password: passwordHash.generate(generatedPassword),
                role_id: 1,
                userprofile_id: userprofileCreate.id,
                slug: slug
            };

            // Membuat user baru
            await User.create(userCreateObj);

            await transaction.commit();
            res.status(200).json(response(200, 'success create userprofile', userprofileCreate));
        } catch (err) {
            await transaction.rollback();
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
    createusereducation: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {

            // Membuat schema untuk validasi
            const schema = {
                educationLevel_id: { type: "number", optional: false },
                instanceName: { type: "string", optional: true },
                department: { type: "string", optional: true },
                gpa: { type: "number", optional: true },
                joinDate: { type: "string", optional: true },
                graduationDate: { type: "string", optional: true },
                desc: { type: "string", optional: true }
            }

            // Buat object userprofile
            let userEducationObj = {
                educationLevel_id: req.body.educationLevel_id,
                instanceName: req.body.instanceName,
                department: req.body.department,
                gpa: req.body.gpa,
                joinDate: req.body.joinDate,
                graduationDate: req.body.graduationDate,
                desc: req.body.desc
            };

            // Validasi menggunakan module fastest-validator
            const validate = v.validate(userEducationObj, schema);
            if (validate.length > 0) {
                // Format pesan error dalam bahasa Indonesia
                const errorMessages = validate.map(error => {
                    if (error.type === 'stringMin') {
                        return `Field ${error.field} minimal ${error.expected} karakter`;
                    } else if (error.type === 'stringMax') {
                        return `Field ${error.field} maksimal ${error.expected} karakter`;
                    } else if (error.type === 'stringPattern') {
                        return `Field ${error.field} format tidak valid`;
                    } else {
                        return `Field ${error.field} tidak valid`;
                    }
                });

                res.status(400).json({
                    status: 400,
                    message: errorMessages.join(', ')
                });
                return;
            }

            // create user education
            let userprofileCreate = await UserEducationHistory.create(userEducationObj)

            res.status(200).json(response(200, 'success create userprofile', userprofileCreate));
        } catch (err) {
            logger.error(`Error: ${err}`);
            logger.error(`Error: ${err.message}`);
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //user update sendiri
    updateuserprofile: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            //mendapatkan data userprofile untuk pengecekan
            let userprofileGet = await UserProfile.findOne({
                where: {
                    slug: req.params.slug,
                    deletedAt: null
                }
            })

            //cek apakah data userprofile ada
            if (!userprofileGet) {
                res.status(404).json(response(404, 'userprofile not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                name: { type: "string", min: 2, optional: true },
                email: { type: "string", min: 5, max: 50, pattern: /^\S+@\S+\.\S+$/, optional: true },
                nik: { type: "string", length: 16, optional: true },
                department: { type: "string", min: 2, optional: true },
                phoneNumber: { type: "string", min: 7, max: 15, pattern: /^[0-9]+$/, optional: true },
                address: { type: "string", min: 3, optional: true },
                religion: { type: "string", optional: true },
                birthPlace: { type: "string", min: 2, optional: true },
                birthDate: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, optional: true },
                maritalStatus: { type: "string", optional: true },
                gender: { type: "string", optional: true },
                employmentStatus: { type: "enum", values: ['Sudah Bekerja', 'Siap Bekerja', 'Tidak Bekerja'], optional: true },
                location: { type: "string", optional: true },
                provinsi: { type: "string", optional: true },
                kabupaten: { type: "string", optional: true },
                kecamatan: { type: "string", optional: true },
                kelurahan: { type: "string", optional: true },
                ktp: { type: "string", optional: true },
                kk: { type: "string", optional: true },
                citizenship: { type: "enum", values: ['WNI', 'WNA'], optional: true, optional: true },
                profession: { type: "string", optional: true },
                pendidikan: { type: "number", optional: true },
            }

            if (req.files) {
                if (req.files.ktp) {
                    const timestamp = new Date().getTime();
                    const uniqueFileName = `${timestamp}-${req.files.ktp[0].originalname}`;

                    const uploadParams = {
                        Bucket: process.env.AWS_S3_BUCKET,
                        Key: `${process.env.PATH_AWS}/file/ktp/${uniqueFileName}`,
                        Body: req.files.ktp[0].buffer,
                        ACL: 'public-read',
                        ContentType: req.files.ktp[0].mimetype
                    };

                    const command = new PutObjectCommand(uploadParams);

                    await s3Client.send(command);

                    req.body.ktp = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
                }
                if (req.files.kk) {
                    const timestamp = new Date().getTime();
                    const uniqueFileName = `${timestamp}-${req.files.kk[0].originalname}`;

                    const uploadParams = {
                        Bucket: process.env.AWS_S3_BUCKET,
                        Key: `${process.env.PATH_AWS}/file/kk/${uniqueFileName}`,
                        Body: req.files.kk[0].buffer,
                        ACL: 'public-read',
                        ContentType: req.files.kk[0].mimetype
                    };
                    const command = new PutObjectCommand(uploadParams);

                    await s3Client.send(command);
                    req.body.kk = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
                }
            }

            //buat object userprofile
            let userprofileUpdateObj = {
                name: req.body.name,
                email: req.body.email,
                nik: req.body.nik,
                department: req.body.department,
                birthPlace: req.body.birthPlace,
                birthDate: req.body.birthDate,
                phoneNumber: req.body.phoneNumber,
                address: req.body.address,
                religion: req.body.religion,
                location: req.body.location,
                provinsi: req.body.provinsi,
                kabupaten: req.body.kabupaten,
                kecamatan: req.body.kecamatan,
                kelurahan: req.body.kelurahan,
                ktp: req.body.ktp,
                kk: req.body.kk,
                citizenship: req.body.citizenship,
                employmentStatus: req.body.employmentStatus,
                maritalStatus: req.body.maritalStatus,
                gender: req.body.gender,
                profession: req.body.profession,
            };

            //validasi menggunakan module fastest-validator
            const validate = v.validate(userprofileUpdateObj, schema);
            if (validate.length > 0) {
                // Format pesan error dalam bahasa Indonesia
                const errorMessages = validate.map(error => {
                    if (error.type === 'stringMin') {
                        return `Field ${error.field} minimal ${error.expected} karakter`;
                    } else if (error.type === 'stringMax') {
                        return `Field ${error.field} maksimal ${error.expected} karakter`;
                    } else if (error.type === 'stringPattern') {
                        return `Field ${error.field} format tidak valid`;
                    } else {
                        return `Field ${error.field} tidak valid`;
                    }
                });

                res.status(400).json({
                    status: 400,
                    message: errorMessages.join(', ')
                });
                return;
            }

            //update userprofile
            await UserProfile.update(userprofileUpdateObj, {
                where: {
                    slug: req.params.slug,
                    deletedAt: null
                }
            })

            //update user
            await User.update({
                email: userprofileUpdateObj.email
            }, {
                where: {
                    id: userprofileGet.user_id
                }
            });

            const userprofileAfterUpdate = await UserProfile.findOne({
                where: {
                    slug: req.params.slug,
                    deletedAt: null
                }
            });

            await transaction.commit();
            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update userprofile', userprofileAfterUpdate));

        } catch (err) {
            await transaction.rollback();
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

    //update about user
    updateaboutuser: async (req, res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                about: { type: "string", min: 2, optional: true },
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(req.body, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            const whereCondition = { slug: req.params.slug };

            //mendapatkan data userprofile untuk pengecekan
            let userprofileGet = await UserProfile.findOne({
                where: whereCondition
            });

            if (!userprofileGet) {
                res.status(404).json(response(404, "Userprofile Not found"));
                return;
            }

            //update userprofile
            await UserProfile.update(req.body, { where: whereCondition });

            //mendapatkan data userprofile setelah update
            let userprofileAfterUpdate = await UserProfile.findOne({
                where: whereCondition
            })

            res.status(200).json(response(200, 'success update userprofile', userprofileAfterUpdate));
        } catch (error) {
            logger.error(`Error : ${error}`);
            logger.error(`Error message: ${error.message}`);
            console.log(err);
            res.status(500).json(response(500, 'internal server error', err));
        }
    },

    updateImageProfile: async (req, res) => {
        try {
            const user = await UserProfile.findOne({ where: { slug: req.params.slug } });

            if (!user) {
                res.status(404).json(response(404, 'user profile not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                image: { type: 'string', optional: false },
            }

            let userprofileUpdateObj = {
                image: req.body.image
            };

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `${process.env.PATH_AWS}/profile/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                userprofileUpdateObj.image = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            const validate = v.validate(userprofileUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update userprofile
            await UserProfile.update(userprofileUpdateObj, { where: { slug: req.params.slug } });

            //mendapatkan data userprofile setelah update
            const userprofileAfterUpdate = await UserProfile.findOne({ where: { slug: req.params.slug } })
            res.status(200).json(response(200, 'success update user profile', userprofileAfterUpdate));

        } catch (error) {
            logger.error(`Error : ${error}`);
            logger.error(`Error message: ${error.message}`);
            console.log(err);
            res.status(500).json(response(500, 'internal server error', err));
        }
    },

    //update data person
    //user update sendiri
    updateuserdocs: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            // Mendapatkan data userprofile untuk pengecekan
            let userprofileGet = await UserProfile.findOne({
                where: {
                    slug: req.params.slug,
                    deletedAt: null
                },
                transaction
            });

            // Cek apakah data userprofile ada
            if (!userprofileGet) {
                await transaction.rollback();
                res.status(404).json(response(404, 'userprofile not found'));
                return;
            }

            let userprofileUpdateObj = {};

            // Update userprofile
            await UserProfile.update(userprofileUpdateObj, {
                where: {
                    slug: req.params.slug,
                },
                transaction
            });

            // Mendapatkan data userprofile setelah update
            let userprofileAfterUpdate = await UserProfile.findOne({
                where: {
                    slug: req.params.slug,
                },
                transaction
            });

            await transaction.commit();

            // Response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update userprofile', userprofileAfterUpdate));

        } catch (err) {
            await transaction.rollback();
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    uploadDocCvPortfolio: async (req, res) => {
        try {
            // Mendapatkan data userprofile untuk pengecekan
            let userprofileGet = await UserProfile.findOne({
                where: {
                    slug: req.params.slug,
                    deletedAt: null
                }
            });

            // Cek apakah data userprofile ada
            if (!userprofileGet) {
                res.status(404).json(response(404, 'userprofile not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                cv: { type: 'string', optional: false },
                portfolio: { type: 'string', optional: false },
            }

            if (req.files) {
                if (req.files.cv) {
                    const timestamp = new Date().getTime();
                    const uniqueFileName = `${timestamp}-${req.files.cv[0].originalname}`;

                    const uploadParams = {
                        Bucket: process.env.AWS_S3_BUCKET,
                        Key: `${process.env.PATH_AWS}/file/cv/${uniqueFileName}`,
                        Body: req.files.cv[0].buffer,
                        ACL: 'public-read',
                        ContentType: req.files.cv[0].mimetype
                    };

                    const command = new PutObjectCommand(uploadParams);

                    await s3Client.send(command);

                    req.body.cv = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
                }
                if (req.files.portfolio) {
                    const timestamp = new Date().getTime();
                    const uniqueFileName = `${timestamp}-${req.files.portfolio[0].originalname}`;

                    const uploadParams = {
                        Bucket: process.env.AWS_S3_BUCKET,
                        Key: `${process.env.PATH_AWS}/file/portfolio/${uniqueFileName}`,
                        Body: req.files.portfolio[0].buffer,
                        ACL: 'public-read',
                        ContentType: req.files.portfolio[0].mimetype
                    };
                    const command = new PutObjectCommand(uploadParams);

                    await s3Client.send(command);
                    req.body.portfolio = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
                }
            }

            const validation = await v.validate(req.body, schema);
            if (validation !== true) {
                return res.status(400).json(response(400, validation));
            }

            await UserProfile.update(req.body, { where: { slug: req.params.slug } });

            const userprofileAfterUpdate = await UserProfile.findOne({ where: { slug: req.params.slug } });

            res.status(200).json(response(200, 'success update userprofile', userprofileAfterUpdate));
        } catch (err) {
            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //menghapus user berdasarkan slug
    deleteuser: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {

            //mendapatkan data user untuk pengecekan
            let userprofileGet = await UserProfile.findOne({
                where: {
                    slug: req.params.slug,
                    deletedAt: null
                },
                transaction
            })

            //cek apakah data user ada
            if (!userprofileGet) {
                await transaction.rollback();
                res.status(404).json(response(404, 'data not found'));
                return;
            }

            const models = Object.keys(sequelize.models);

            // Array untuk menyimpan promise update untuk setiap model terkait
            const updatePromises = [];

            // Lakukan soft delete pada semua model terkait
            models.forEach(async modelName => {
                const Model = sequelize.models[modelName];
                if (Model.associations && Model.associations.UserProfile && Model.rawAttributes.deletedAt) {
                    updatePromises.push(
                        Model.update({ deletedAt: new Date() }, {
                            where: {
                                userprofile_id: userprofileGet.id
                            },
                            transaction
                        })
                    );
                }
            });

            // Jalankan semua promise update secara bersamaan
            await Promise.all(updatePromises);

            await UserProfile.update({ deletedAt: new Date() }, {
                where: {
                    slug: req.params.slug
                },
                transaction
            });

            await transaction.commit();

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success delete user'));

        } catch (err) {
            // Rollback transaksi jika terjadi kesalahan
            await transaction.rollback();
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    //mengupdate berdasarkan user
    updateprofil: async (req, res) => {
        try {
            //mendapatkan data fotoprofil untuk pengecekan

            let fotoprofilGet = await UserProfile.findOne({
                where: {
                    slug: req.params.slug,
                    deletedAt: null
                },
            });

            //cek apakah data fotoprofil ada
            if (!fotoprofilGet) {
                res.status(404).json(response(404, 'fotoprofil not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                fotoprofil: {
                    type: "string",
                    optional: true
                }
            }

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `${process.env.PATH_AWS}/fotoprofil/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                fotoprofilKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            console.log("abc", fotoprofilKey)


            //buat object fotoprofil
            let fotoprofilUpdateObj = {
                foto: req.file ? fotoprofilKey : undefined,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(fotoprofilUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update fotoprofil
            await UserProfile.update(fotoprofilUpdateObj, {
                where: {
                    slug: fotoprofilGet.slug,
                },
            });

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update fotoprofil'));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    generateCv: async (req, res) => {
        try {

            const includeModels = [
                { model: UserProfile },
                { model: UserExperience },
                { model: UserEducationHistory },
                { model: UserOrganization },
                { model: UserSkill },
                { model: UserCertificate },
            ];

            const user = await User.findOne({
                where: { id: 5 },
                include: includeModels,
                order: [['id', 'DESC']]
            })


            // Generate HTML content for PDF
            const templatePath = path.resolve(__dirname, '../views/cv/cv.html');
            const templateJobPath = path.resolve(__dirname, '../views/cv/job.html');
            let jobContent = fs.readFileSync(templateJobPath, 'utf8');
            let htmlContent = fs.readFileSync(templatePath, 'utf8');

            htmlContent = htmlContent.replace('{{name}}', user.UserProfile.name);
            htmlContent = htmlContent.replace('{{phoneNumber}}', user.UserProfile.phoneNumber);
            htmlContent = htmlContent.replace('{{email}}', user.email);
            htmlContent = htmlContent.replace('{{about}}', user.UserProfile.about);

            // const reportTableRows = riwayatAntrian[0]?.map(antrian => {
            //     const createdAtDate = new Date(antrian.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
            //     const createdAtTime = new Date(antrian.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            //     const updatedAtTime = new Date(antrian.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            //     const statusText = antrian.status ? 'Selesai' : 'Menunggu';

            //     return `
            //         <tr>
            //             <td>${antrian.code}</td>
            //             <td class="center">${createdAtDate}</td>
            //             <td class="center">${createdAtTime} WIB</td>
            //             <td class="center">${updatedAtTime} WIB</td>
            //             <td class="center">${statusText}</td>
            //         </tr>
            //     `;
            // }).join('');



            // user.UserExperiences.map((experience) => {
            //     jobContent = jobContent.replace('{{title}}', experience.title);
            //     jobContent = jobContent.replace('{{companyName}}', experience.companyName);
            //     jobContent = jobContent.replace('{{joinDate}}', experience.joinDate);
            //     if(experience.isCurrently === 'true'){
            //         jobContent = jobContent.replace('{{leaveDate}}', 'Sekarang');
            //     } else {
            //         jobContent = jobContent.replace('{{leaveDate}}', experience.leaveDate);
            //     }
            //     jobContent = jobContent.replace('{{desc}}', experience.desc);
            // })

            const templateJob = user.UserExperiences.map((experience) => {
                let leaveDate;
                if (experience.isCurrently === 'true') {
                    leaveDate = 'Sekarang';
                } else {
                    leaveDate = experience.leaveDate;
                }

                return `
                <div class="job">
                    <div style="display: flex; justify-content: space-between;">
                        <div style="margin-top: 5px;">
                            <p class="job-title">${experience.title}</p>
                            <div style="margin-top: 5px !important;"></div>
                            <p class="company-name" style="margin-top: 5px;">${experience.companyName}</p>
                        </div>
                        <p>${experience.joinDate} - ${leaveDate}</p>
                    </div>
                    ${experience.desc}
                </div>
                `
            }).join('');


            htmlContent = htmlContent.replace('{{templateJob}}', templateJob);

            // Launch Puppeteer
            const browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            // Set HTML content
            await page.setContent(`${htmlContent}`, { waitUntil: 'networkidle0' });

            // Generate PDF
            const pdfBuffer = await page.pdf({
                format: 'Legal',
                landscape: false,
                margin: {
                    top: '20px',
                    right: '15px',
                    bottom: '20px',
                    left: '25px'
                }
            });

            await browser.close();

            // Generate filename
            const currentDate = new Date().toISOString().replace(/:/g, '-');
            const filename = `cv-${currentDate}.pdf`;

            // Set headers dan kirim file PDF
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Type', 'application/pdf');
            res.end(pdfBuffer, 'binary');

        } catch (err) {
            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            res.status(500).json(response(500, 'internal server error', err.message));
        }
    },

    getCompanyProfile: async (req, res) => {
        try {
            const whereCondition = { user_id: auth.userId };

            const company = await Company.findOne({ where: whereCondition, include: [{ model: User, attributes: ['id', 'email', 'slug'] }] });
            if (!company) {
                return res.status(404).json(response(404, 'company not found'));
            }

            res.status(200).json(response(200, 'success get company profile', company));
        } catch (err) {
            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            res.status(500).json(response(500, 'internal server error', err.message));
        }
    },

    updateCompany: async (req, res) => {
        try {
            const company = await Company.findOne({ where: { user_id: auth.userId } });
            if (!company) {
                return res.status(404).json(response(404, 'company not found'));
            }

            const schema = {
                name: { type: "string", optional: true },
                department: { type: "string", optional: true },
                linkedin: { type: "string", optional: true },
                instagram: { type: "string", optional: true },
                numberEmployee: { type: "number", optional: true, convert: true },
                phone: { type: "string", optional: true },
                address: { type: "string", optional: true },
                desc: { type: "string", optional: true },
                website: { type: "string", optional: true },
                imageLogo: { type: "string", optional: true },
                imageBanner: { type: "string", optional: true }
            };

            if (req.files) {
                if (req.files.imageLogo) {
                    const timestamp = new Date().getTime();
                    const uniqueFileName = `${timestamp}-${req.files.imageLogo[0].originalname}`;

                    const uploadParams = {
                        Bucket: process.env.AWS_S3_BUCKET,
                        Key: `${process.env.PATH_AWS}/file/imageLogo/${uniqueFileName}`,
                        Body: req.files.imageLogo[0].buffer,
                        ACL: 'public-read',
                        ContentType: req.files.imageLogo[0].mimetype
                    };

                    const command = new PutObjectCommand(uploadParams);

                    await s3Client.send(command);

                    req.body.imageLogo = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
                }
                if (req.files.imageBanner) {
                    const timestamp = new Date().getTime();
                    const uniqueFileName = `${timestamp}-${req.files.imageBanner[0].originalname}`;

                    const uploadParams = {
                        Bucket: process.env.AWS_S3_BUCKET,
                        Key: `${process.env.PATH_AWS}/file/transkrip/${uniqueFileName}`,
                        Body: req.files.imageBanner[0].buffer,
                        ACL: 'public-read',
                        ContentType: req.files.imageBanner[0].mimetype
                    };
                    const command = new PutObjectCommand(uploadParams);

                    await s3Client.send(command);
                    req.body.imageBanner = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
                }
            }

            const companyUpdateObj = {
                name: req.body.name,
                department: req.body.department,
                numberEmployee: req.body.numberEmployee,
                linkedin: req.body.linkedin,
                instagram: req.body.instagram,
                phone: req.body.phone,
                address: req.body.address,
                desc: req.body.desc,
                website: req.body.website,
                imageLogo: req.body.imageLogo,
                imageBanner: req.body.imageBanner
            };

            const validate = v.validate(companyUpdateObj, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, 'validation failed', validate));
            }

            await Company.update(companyUpdateObj, {
                where: {
                    user_id: auth.userId,
                },
            });

            const companyUpdate = await Company.findOne({ where: { user_id: auth.userId } });

            res.status(200).json(response(200, 'success update company', companyUpdate));
        } catch (err) {
            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            res.status(500).json(response(500, 'internal server error', err.message));
        }
    }

}