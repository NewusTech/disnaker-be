const { response } = require('../helpers/response.formatter');
const { Artikel, Kategoriartikel } = require('../models');
const slugify = require('slugify');
const Validator = require("fastest-validator");
const logger = require('../errorHandler/logger');
const v = new Validator();
const moment = require('moment-timezone');
const { generatePagination } = require('../pagination/pagination');
const { Op } = require('sequelize');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    useAccelerateEndpoint: true
});

module.exports = {

    //membuat artikel
    createartikel: async (req, res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                title: { type: "string", min: 3 },
                desc: { type: "string", min: 3, optional: true },
                image: { type: "string", optional: true },
                mediaLink:{type: "string", optional: true},
                kategori_id: { type: "number", optional: true }
            }

            if (req.files) {
                if (req.files.image) {
                    const timestamp = new Date().getTime();
                    const uniqueFileName = `${timestamp}-${req.files.image[0].originalname}`;

                    const uploadParams = {
                        Bucket: process.env.AWS_S3_BUCKET,
                        Key: `${process.env.PATH_AWS}/galeri/${uniqueFileName}`,
                        Body: req.files.image[0].buffer,
                        ACL: 'public-read',
                        ContentType: req.files.image[0].mimetype
                    };

                    const command = new PutObjectCommand(uploadParams);

                    await s3Client.send(command);

                    imageKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
                }
                if (req.files.mediaLink) {
                    const timestamp = new Date().getTime();
                    const uniqueFileName = `${timestamp}-${req.files.mediaLink[0].originalname}`;

                    const uploadParams = {
                        Bucket: process.env.AWS_S3_BUCKET,
                        Key: `${process.env.PATH_AWS}/galeri/video${uniqueFileName}`,
                        Body: req.files.mediaLink[0].buffer,
                        ACL: 'public-read',
                        ContentType: req.files.mediaLink[0].mimetype
                    };
                    const command = new PutObjectCommand(uploadParams);

                    await s3Client.send(command);
                    mediaLink = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
                }
            }

            //buat object artikel
            let artikelCreateObj = {
                title: req.body.title,
                slug: req.body.title ? slugify(req.body.title, { lower: true }) : null,
                desc: req.body.desc,
                image: req.files.image ? imageKey : null,
                mediaLink: req.files.mediaLink ? mediaLink : null,
                kategori_id: req.body.kategori_id !== undefined ? Number(req.body.kategori_id) : null,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(artikelCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //mendapatkan data data untuk pengecekan
            let dataGets = await Artikel.findOne({
                where: {
                    slug: artikelCreateObj?.slug
                }
            });

            //cek apakah slug sudah terdaftar
            if (dataGets) {
                res.status(409).json(response(409, 'slug already registered'));
                return;
            }

            //buat artikel
            let artikelCreate = await Artikel.create(artikelCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create artikel', artikelCreate));
        } catch (err) {
            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            res.status(500).json(response(500, 'internal server error', err));
            
            console.log(err);
        }
    },

    //mendapatkan semua data artikel
    getartikel: async (req, res) => {
        try {
            let { start_date, end_date, search } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let artikelGets;
            let totalCount;
    
            const whereCondition = {};
    
            if (search) {
                whereCondition[Op.or] = [{ title: { [Op.iLike]: `%${search}%` } }];
            }

            if (start_date && end_date) {
                whereCondition.createdAt = { [Op.between]: [moment(start_date).startOf('day').toDate(), moment(end_date).endOf('day').toDate()] };
            } else if (start_date) {
                whereCondition.createdAt = { [Op.gte]: moment(start_date).startOf('day').toDate() };
            } else if (end_date) {
                whereCondition.createdAt = { [Op.lte]: moment(end_date).endOf('day').toDate() };
            }
    
            [artikelGets, totalCount] = await Promise.all([
                Artikel.findAll({
                    include: [{ model: Kategoriartikel, attributes: ['id', 'title'] }],
                    where: whereCondition,
                    limit: limit,
                    offset: offset
                }),
                Artikel.count({
                    where: whereCondition
                })
            ]);
    
            const pagination = generatePagination(totalCount, page, limit, '/api/artikel/get');
    
            res.status(200).json({
                status: 200,
                message: 'success get artikel',
                data: artikelGets,
                pagination: pagination
            });
    
        } catch (err) {
            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data artikel berdasarkan slug
    getartikelBySlug: async (req, res) => {
        try {
            const whereCondition = { slug: req.params.slug };

            //mendapatkan data artikel berdasarkan slug
            let artikelGet = await Artikel.findOne({
                include: [{ model: Kategoriartikel, attributes: ['id', 'title'] }],
                where: whereCondition
            });

            //cek jika artikel tidak ada
            if (!artikelGet) {
                res.status(404).json(response(404, 'artikel not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get artikel by slug', artikelGet));
        } catch (err) {
            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate artikel berdasarkan slug
    updateartikel: async (req, res) => {
        try {
            //mendapatkan data artikel untuk pengecekan
            let artikelGet = await Artikel.findOne({
                where: {
                    slug: req.params.slug,
                }
            })

            //cek apakah data artikel ada
            if (!artikelGet) {
                res.status(404).json(response(404, 'artikel not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                title: { type: "string", min: 3, optional: true },
                desc: { type: "string", min: 3, optional: true },
                image: { type: "string", optional: true },
                mediaLink: { type: "string", optional: true },
                kategori_id: { type: "number", optional: true }
            }

            if (req.files) {
                if (req.files.image) {
                    const timestamp = new Date().getTime();
                    const uniqueFileName = `${timestamp}-${req.files.image[0].originalname}`;

                    const uploadParams = {
                        Bucket: process.env.AWS_S3_BUCKET,
                        Key: `${process.env.PATH_AWS}/galeri/${uniqueFileName}`,
                        Body: req.files.image[0].buffer,
                        ACL: 'public-read',
                        ContentType: req.files.image[0].mimetype
                    };

                    const command = new PutObjectCommand(uploadParams);

                    await s3Client.send(command);

                    imageKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
                }
                if (req.files.mediaLink) {
                    const timestamp = new Date().getTime();
                    const uniqueFileName = `${timestamp}-${req.files.mediaLink[0].originalname}`;

                    const uploadParams = {
                        Bucket: process.env.AWS_S3_BUCKET,
                        Key: `${process.env.PATH_AWS}/galeri/video${uniqueFileName}`,
                        Body: req.files.mediaLink[0].buffer,
                        ACL: 'public-read',
                        ContentType: req.files.mediaLink[0].mimetype
                    };
                    const command = new PutObjectCommand(uploadParams);

                    await s3Client.send(command);
                    mediaLink = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
                }
            }

            //buat object artikel
            let artikelUpdateObj = {
                title: req.body.title ?? artikelGet.title,
                slug: req.body.title ? slugify(req.body.title, { lower: true }) : artikelGet.slug,
                desc: req.body.desc ?? artikelGet.desc,
                image: req.files.image ? imageKey : artikelGet.image,
                mediaLink: req.files.mediaLink ? mediaLink : artikelGet.mediaLink,
                kategori_id: req.body.kategori_id !== undefined ? Number(req.body.kategori_id) : artikelGet.kategori_id,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(artikelUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update artikel
            await Artikel.update(artikelUpdateObj, {
                where: {
                    slug: req.params.slug,
                }
            })

            //mendapatkan data artikel setelah update
            let artikelAfterUpdate = await Artikel.findOne({
                where: {
                    slug: req.params.slug,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update artikel', artikelAfterUpdate));

        } catch (err) {
            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //menghapus artikel berdasarkan slug
    deleteartikel: async (req, res) => {
        try {

            //mendapatkan data artikel untuk pengecekan
            let artikelGet = await Artikel.findOne({
                where: {
                    slug: req.params.slug                }
            })

            //cek apakah data artikel ada
            if (!artikelGet) {
                res.status(404).json(response(404, 'artikel not found'));
                return;
            }

            await Artikel.destroy({
                where: {
                    slug: req.params.slug,
                }
            })


            res.status(200).json(response(200, 'success delete artikel'));

        } catch (err) {
            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    }
}