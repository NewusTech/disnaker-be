const { response } = require('../helpers/response.formatter');
const logger = require('../errorHandler/logger');
const { Role, RoleHasPermission, sequelize } = require('../models');
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = {

    //membuat role
    createrole: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            //membuat schema untuk validasi
            const schema = {
                name: { type: "string", min: 3, },
                permissions: { type: "array", min: 1, }
            }

            //buat object role
            let roleCreateObj = {
                name: req.body.name,
                permissions: req.body.permissions
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(roleCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //buat role
            let roleCreate = await Role.create(roleCreateObj);

            roleCreateObj.permissions.forEach(async (item) => {
                await RoleHasPermission.create({
                    role_id: roleCreate.id,
                    permission_id: item
                });
            });
            await transaction.commit();
            res.status(201).json(response(201, 'success create role', roleCreate));
        } catch (err) {
            await transaction.rollback();
            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua data role
    getrole: async (req, res) => {
        try {
            //mendapatkan data semua role
            let roleGets = await Role.findAll({});

            res.status(200).json(response(200, 'success get role', roleGets));

        } catch (err) {
            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data role berdasarkan id
    getroleById: async (req, res) => {
        try {
            //mendapatkan data role berdasarkan id
            let roleGet = await Role.findOne({
                where: {
                    id: req.params.id
                },
            });

            //cek jika role tidak ada
            if (!roleGet) {
                res.status(404).json(response(404, 'role not found'));
                return;
            }

            res.status(200).json(response(200, 'success get role by id', roleGet));
        } catch (err) {
            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate role berdasarkan id
    updaterole: async (req, res) => {
        try {
            //mendapatkan data role untuk pengecekan
            let roleGet = await Role.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data role ada
            if (!roleGet) {
                res.status(404).json(response(404, 'role not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                name: {
                    type: "string",
                    min: 3,
                    optional: true
                },
                permissions: {
                    type: "array",
                    min: 1,
                    optional: true
                }
            }

            //buat object role
            let roleUpdateObj = {
                name: req.body.name,
                permissions: req.body.permissions
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(roleUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update role
           const updateRole =  await Role.update(roleUpdateObj, {
                where: {
                    id: req.params.id,
                }
            })

            //menghapus semua permission role
            await RoleHasPermission.destroy({
                where: {
                    role_id: req.params.id
                }
            })
            
            roleUpdateObj.permissions.forEach(async (item) => {
                const roleHasPermission = await RoleHasPermission.create({
                    role_id: req.params.id,
                    permission_id: item
                });

                console.log(roleHasPermission.dataValues);
            });


            //mendapatkan data role setelah update
            let roleAfterUpdate = await Role.findOne({
                where: {
                    id: req.params.id,
                }
            })

            res.status(200).json(response(200, 'success update role', roleAfterUpdate));

        } catch (err) {
            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //menghapus role berdasarkan id
    deleterole: async (req, res) => {
        try {

            //mendapatkan data role untuk pengecekan
            let roleGet = await Role.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data role ada
            if (!roleGet) {
                res.status(404).json(response(404, 'role not found'));
                return;
            }

            await Role.destroy({
                where: {
                    id: req.params.id,
                }
            })

            res.status(200).json(response(200, 'success delete role'));

        } catch (err) {
            if (err.name === 'SequelizeForeignKeyConstraintError') {
                res.status(400).json(response(400, 'Data tidak bisa dihapus karena masih digunakan pada tabel lain'));
            } else {
                res.status(500).json(response(500, 'Internal server error', err));
                console.log(err);
            }
        }
    }
}