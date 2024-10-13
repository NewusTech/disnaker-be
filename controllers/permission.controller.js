const { response } = require('../helpers/response.formatter');
const logger = require('../errorHandler/logger');
const { Permission, Role, RoleHasPermission, sequelize } = require('../models');
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = {

    //membuat permission
    createpermission: async (req, res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                name: {
                    type: "string",
                    min: 3,
                },
            }

            //buat object permission
            let permissionCreateObj = {
                name: req.body.name,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(permissionCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //buat permission
            let permissionCreate = await Permission.create(permissionCreateObj);

            res.status(201).json(response(201, 'success create permission', permissionCreate));
        } catch (err) {
            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua data permission
    getpermission: async (req, res) => {
        try {
            //mendapatkan data semua permission
            let permissionGets = await Permission.findAll({
                order: [['id', 'ASC']]
            });

            res.status(200).json(response(200, 'success get permission', permissionGets));

        } catch (err) {
            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data permission berdasarkan id
    getpermissionById: async (req, res) => {
        try {
            //mendapatkan data permission berdasarkan id
            let permissionGet = await Permission.findOne({
                where: {
                    id: req.params.id
                },
            });

            //cek jika permission tidak ada
            if (!permissionGet) {
                res.status(404).json(response(404, 'permission not found'));
                return;
            }

            res.status(200).json(response(200, 'success get permission by id', permissionGet));
        } catch (err) {
            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate permission berdasarkan id
    updatepermission: async (req, res) => {
        try {
            //mendapatkan data permission untuk pengecekan
            let permissionGet = await Permission.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data permission ada
            if (!permissionGet) {
                res.status(404).json(response(404, 'permission not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                name: {
                    type: "string",
                    min: 3,
                    optional: true
                },
            }

            //buat object permission
            let permissionUpdateObj = {
                name: req.body.name,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(permissionUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update permission
            await Permission.update(permissionUpdateObj, {
                where: {
                    id: req.params.id,
                }
            })

            //mendapatkan data permission setelah update
            let permissionAfterUpdate = await Permission.findOne({
                where: {
                    id: req.params.id,
                }
            })

            res.status(200).json(response(200, 'success update permission', permissionAfterUpdate));

        } catch (err) {
            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //menghapus permission berdasarkan id
    deletepermission: async (req, res) => {
        try {

            //mendapatkan data permission untuk pengecekan
            let permissionGet = await Permission.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data permission ada
            if (!permissionGet) {
                res.status(404).json(response(404, 'permission not found'));
                return;
            }

            await Permission.destroy({
                where: {
                    id: req.params.id,
                }
            })

            res.status(200).json(response(200, 'success delete permission'));

        } catch (err) {
            if (err.name === 'SequelizeForeignKeyConstraintError') {
                res.status(400).json(response(400, 'Data tidak bisa dihapus karena masih digunakan pada tabel lain'));
            } else {
                res.status(500).json(response(500, 'Internal server error', err));
                console.log(err);
            }
        }
    },

    assignPermission: async (req, res) => {
        const transaction = await sequelize.transaction();
        const { permissions, roleId } = req.body;
        
        try {
            const role = await Role.findOne({ where: { id: roleId } });
            if (!role) {
                return res.status(404).json({ message: 'Role not found' });
            }

            const tempPermissions = [];

            for (const permissionId of permissions) {
                let permission = await Permission.findOne({ where: { id: permissionId } });

                if (!permission) {
                    return res.status(404).json({ message: 'Permission not found' });
                }

                tempPermissions.push({
                    role_id: roleId,
                    permission_id: permission.id
                });
            }

            await RoleHasPermission.destroy({
                where: { role_id: roleId }
            });

            for (const tempPermission of tempPermissions) {
                await RoleHasPermission.create({ role_id: tempPermission.role_id, permission_id: tempPermission.permission_id });
            }
            await transaction.commit();
            return res.status(200).json(response(200, 'success save user permission'));

        } catch (error) {
            await transaction.rollback();
            logger.error(`Error : ${error}`);
            logger.error(`Error message: ${error.message}`);
            console.error('Error updating user permissions:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}