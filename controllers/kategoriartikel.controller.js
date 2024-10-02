const { response } = require('../helpers/response.formatter');
const logger = require('../errorHandler/logger');
const { Kategoriartikel } = require('../models');

const Validator = require("fastest-validator");
const v = new Validator();
const { Op } = require('sequelize');

module.exports = {

    //membuat kategoriartikel
    createkategoriartikel: async (req, res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                title: {
                    type: "string",
                    min: 3,
                },
            }

            //buat object kategoriartikel
            let kategoriartikelCreateObj = {
                title: req.body.title,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(kategoriartikelCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //buat kategoriartikel
            let kategoriartikelCreate = await Kategoriartikel.create(kategoriartikelCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create kategori artikel', kategoriartikelCreate));
        } catch (err) {
            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua data kategoriartikel
    getkategoriartikel: async (req, res) => {
        try {
            let kategoriartikelGets;
            const search = req.query.search ?? null;

            if (search) {
                [kategoriartikelGets] = await Promise.all([
                    Kategoriartikel.findAll({
                        where: {
                            [Op.or]: [
                                { title: { [Op.iLike]: `%${search}%` } }
                            ]
                        },
                    }),
                ]);
            } else {
                [kategoriartikelGets] = await Promise.all([
                    Kategoriartikel.findAll({
                    }),
                ]);
            }

            res.status(200).json(response(200, 'success get DATA', kategoriartikelGets));

        } catch (err) {
            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data kategoriartikel berdasarkan id
    getkategoriartikelById: async (req, res) => {
        try {
            //mendapatkan data kategoriartikel berdasarkan id
            let kategoriartikelGet = await Kategoriartikel.findOne({
                where: {
                    id: req.params.id
                },
            });

            //cek jika kategoriartikel tidak ada
            if (!kategoriartikelGet) {
                res.status(404).json(response(404, 'kategoriartikel not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get kategoriartikel by id', kategoriartikelGet));
        } catch (err) {
            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate kategoriartikel berdasarkan id
    updatekategoriartikel: async (req, res) => {
        try {
            //mendapatkan data kategoriartikel untuk pengecekan
            let kategoriartikelGet = await Kategoriartikel.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data kategoriartikel ada
            if (!kategoriartikelGet) {
                res.status(404).json(response(404, 'kategoriartikel not found'));
                return;
            }

            const oldImagePublicId = kategoriartikelGet.image ? kategoriartikelGet.image.split('/').pop().split('.')[0] : null;

            //membuat schema untuk validasi
            const schema = {
                title: {
                    type: "string",
                    min: 3,
                    optional: true
                },
            }

            //buat object kategoriartikel
            let kategoriartikelUpdateObj = {
                title: req.body.title,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(kategoriartikelUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update kategoriartikel
            await Kategoriartikel.update(kategoriartikelUpdateObj, {
                where: {
                    id: req.params.id,
                }
            })

            //mendapatkan data kategoriartikel setelah update
            let kategoriartikelAfterUpdate = await Kategoriartikel.findOne({
                where: {
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update kategoriartikel', kategoriartikelAfterUpdate));

        } catch (err) {
            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //menghapus kategoriartikel berdasarkan id
    deletekategoriartikel: async (req, res) => {
        try {

            //mendapatkan data kategoriartikel untuk pengecekan
            let kategoriartikelGet = await Kategoriartikel.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data kategoriartikel ada
            if (!kategoriartikelGet) {
                res.status(404).json(response(404, 'kategoriartikel not found'));
                return;
            }

            await Kategoriartikel.destroy({
                where: {
                    id: req.params.id,
                }
            })

            res.status(200).json(response(200, 'success delete kategoriartikel'));

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