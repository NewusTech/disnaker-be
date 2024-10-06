const { response } = require('../helpers/response.formatter');
const { Vacancy, VacancyCategory, EducationLevel, VacancyEducationLevel, Company, VacancySkill, Skill } = require('../models');
const slugify = require('slugify');
const Validator = require("fastest-validator");
const logger = require('../errorHandler/logger');
const v = new Validator();
const moment = require('moment-timezone');
const { generatePagination } = require('../pagination/pagination');
const { Op } = require('sequelize');

module.exports = {

  //membuat vacancy
  // createvacancy: async (req, res) => {
  //     try {

  //         //membuat schema untuk validasi
  //         const schema = {
  //             title: { type: "string", min: 3 },
  //             desc: { type: "string", min: 3, optional: true },
  //             image: { type: "string", optional: true },
  //             mediaLink:{type: "string", optional: true},
  //             kategori_id: { type: "number", optional: true }
  //         }

  //         if (req.files) {
  //             if (req.files.image) {
  //                 const timestamp = new Date().getTime();
  //                 const uniqueFileName = `${timestamp}-${req.files.image[0].originalname}`;

  //                 const uploadParams = {
  //                     Bucket: process.env.AWS_S3_BUCKET,
  //                     Key: `${process.env.PATH_AWS}/galeri/${uniqueFileName}`,
  //                     Body: req.files.image[0].buffer,
  //                     ACL: 'public-read',
  //                     ContentType: req.files.image[0].mimetype
  //                 };

  //                 const command = new PutObjectCommand(uploadParams);

  //                 await s3Client.send(command);

  //                 imageKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
  //             }
  //             if (req.files.mediaLink) {
  //                 const timestamp = new Date().getTime();
  //                 const uniqueFileName = `${timestamp}-${req.files.mediaLink[0].originalname}`;

  //                 const uploadParams = {
  //                     Bucket: process.env.AWS_S3_BUCKET,
  //                     Key: `${process.env.PATH_AWS}/galeri/video${uniqueFileName}`,
  //                     Body: req.files.mediaLink[0].buffer,
  //                     ACL: 'public-read',
  //                     ContentType: req.files.mediaLink[0].mimetype
  //                 };
  //                 const command = new PutObjectCommand(uploadParams);

  //                 await s3Client.send(command);
  //                 mediaLink = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
  //             }
  //         }

  //         //buat object vacancy
  //         let vacancyCreateObj = {
  //             title: req.body.title,
  //             slug: req.body.title ? slugify(req.body.title, { lower: true }) : null,
  //             desc: req.body.desc,
  //             image: req.files.image ? imageKey : null,
  //             mediaLink: req.files.mediaLink ? mediaLink : null,
  //             kategori_id: req.body.kategori_id !== undefined ? Number(req.body.kategori_id) : null,
  //         }

  //         //validasi menggunakan module fastest-validator
  //         const validate = v.validate(vacancyCreateObj, schema);
  //         if (validate.length > 0) {
  //             res.status(400).json(response(400, 'validation failed', validate));
  //             return;
  //         }

  //         //mendapatkan data data untuk pengecekan
  //         let dataGets = await Vacancy.findOne({
  //             where: {
  //                 slug: vacancyCreateObj?.slug
  //             }
  //         });

  //         //cek apakah slug sudah terdaftar
  //         if (dataGets) {
  //             res.status(409).json(response(409, 'slug already registered'));
  //             return;
  //         }

  //         //buat vacancy
  //         let vacancyCreate = await Vacancy.create(vacancyCreateObj);

  //         //response menggunakan helper response.formatter
  //         res.status(201).json(response(201, 'success create vacancy', vacancyCreate));
  //     } catch (err) {
  //         logger.error(`Error : ${err}`);
  //         logger.error(`Error message: ${err.message}`);
  //         res.status(500).json(response(500, 'internal server error', err));

  //         console.log(err);
  //     }
  // },

  //mendapatkan semua data vacancy
  getvacancy: async (req, res) => {
    try {
      let { start_date, end_date, search } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      let vacancyGets;
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

      if (auth.roleId === 2) {
        whereCondition.isPublished = { [Op.eq]: 'true' };
        console.log('Role: ', auth.roleId);
      }
      [vacancyGets, totalCount] = await Promise.all([
        Vacancy.findAll({
          attributes: ['id', 'title', 'slug', 'workLocation', 'jobType', 'desc', 'applicationDeadline', 'isPublished', 'createdAt', 'updatedAt'],
          include: [
            { model: Company, attributes: ['id', 'name', 'imageLogo'] },
            { model: VacancyCategory, attributes: ['id', 'name'] }
          ],
          where: whereCondition,
          limit: limit,
          offset: offset
        }),
        Vacancy.count({
          where: whereCondition
        })
      ]);

      const pagination = generatePagination(totalCount, page, limit, '/api/vacancy/get');

      res.status(200).json({
        status: 200,
        message: 'success get vacancy',
        data: vacancyGets,
        pagination: pagination
      });

    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  },

  //mendapatkan data vacancy berdasarkan slug
  getvacancyBySlug: async (req, res) => {
    try {
      const whereCondition = { slug: req.params.slug };

      //mendapatkan data vacancy berdasarkan slug
      let vacancyGet = await Vacancy.findOne({
        attributes: ['id', 'title', 'slug', 'workLocation', 'jobType', 'minExperience', 'desc', 'maxAge', 'responsibility', 'requirement', 'applicationDeadline', 'isPublished', 'createdAt', 'updatedAt'],
        where: whereCondition,
        include: [
          { model: Company, attributes: ['id', 'name', 'imageLogo', 'imageBanner', 'desc', 'address', 'numberEmployee', 'website', 'instagram'] },
          { model: VacancyCategory, attributes: ['id', 'name'] },
          {
            model: VacancyEducationLevel,
            include: [{ model: EducationLevel, }]
          },
          {
            model: VacancySkill,
            include: [{ model: Skill }]
          }
        ],
      });

      //cek jika vacancy tidak ada
      if (!vacancyGet) {
        res.status(404).json(response(404, 'vacancy not found'));
        return;
      }

      //response menggunakan helper response.formatter
      res.status(200).json(response(200, 'success get vacancy by slug', vacancyGet));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  },

  //mengupdate vacancy berdasarkan slug
  // updatevacancy: async (req, res) => {
  //     try {
  //         //mendapatkan data vacancy untuk pengecekan
  //         let vacancyGet = await Vacancy.findOne({
  //             where: {
  //                 slug: req.params.slug,
  //             }
  //         })

  //         //cek apakah data vacancy ada
  //         if (!vacancyGet) {
  //             res.status(404).json(response(404, 'vacancy not found'));
  //             return;
  //         }

  //         //membuat schema untuk validasi
  //         const schema = {
  //             title: { type: "string", min: 3, optional: true },
  //             desc: { type: "string", min: 3, optional: true },
  //             image: { type: "string", optional: true },
  //             mediaLink: { type: "string", optional: true },
  //             kategori_id: { type: "number", optional: true }
  //         }

  //         if (req.files) {
  //             if (req.files.image) {
  //                 const timestamp = new Date().getTime();
  //                 const uniqueFileName = `${timestamp}-${req.files.image[0].originalname}`;

  //                 const uploadParams = {
  //                     Bucket: process.env.AWS_S3_BUCKET,
  //                     Key: `${process.env.PATH_AWS}/galeri/${uniqueFileName}`,
  //                     Body: req.files.image[0].buffer,
  //                     ACL: 'public-read',
  //                     ContentType: req.files.image[0].mimetype
  //                 };

  //                 const command = new PutObjectCommand(uploadParams);

  //                 await s3Client.send(command);

  //                 imageKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
  //             }
  //             if (req.files.mediaLink) {
  //                 const timestamp = new Date().getTime();
  //                 const uniqueFileName = `${timestamp}-${req.files.mediaLink[0].originalname}`;

  //                 const uploadParams = {
  //                     Bucket: process.env.AWS_S3_BUCKET,
  //                     Key: `${process.env.PATH_AWS}/galeri/video${uniqueFileName}`,
  //                     Body: req.files.mediaLink[0].buffer,
  //                     ACL: 'public-read',
  //                     ContentType: req.files.mediaLink[0].mimetype
  //                 };
  //                 const command = new PutObjectCommand(uploadParams);

  //                 await s3Client.send(command);
  //                 mediaLink = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
  //             }
  //         }

  //         //buat object vacancy
  //         let vacancyUpdateObj = {
  //             title: req.body.title ?? vacancyGet.title,
  //             slug: req.body.title ? slugify(req.body.title, { lower: true }) : vacancyGet.slug,
  //             desc: req.body.desc ?? vacancyGet.desc,
  //             image: req.files.image ? imageKey : vacancyGet.image,
  //             mediaLink: req.files.mediaLink ? mediaLink : vacancyGet.mediaLink,
  //             kategori_id: req.body.kategori_id !== undefined ? Number(req.body.kategori_id) : vacancyGet.kategori_id,
  //         }

  //         //validasi menggunakan module fastest-validator
  //         const validate = v.validate(vacancyUpdateObj, schema);
  //         if (validate.length > 0) {
  //             res.status(400).json(response(400, 'validation failed', validate));
  //             return;
  //         }

  //         //update vacancy
  //         await Vacancy.update(vacancyUpdateObj, {
  //             where: {
  //                 slug: req.params.slug,
  //             }
  //         })

  //         //mendapatkan data vacancy setelah update
  //         let vacancyAfterUpdate = await Vacancy.findOne({
  //             where: {
  //                 slug: req.params.slug,
  //             }
  //         })

  //         //response menggunakan helper response.formatter
  //         res.status(200).json(response(200, 'success update vacancy', vacancyAfterUpdate));

  //     } catch (err) {
  //         logger.error(`Error : ${err}`);
  //         logger.error(`Error message: ${err.message}`);
  //         res.status(500).json(response(500, 'internal server error', err));
  //         console.log(err);
  //     }
  // },

  //menghapus vacancy berdasarkan slug
  // deletevacancy: async (req, res) => {
  //     try {

  //         //mendapatkan data vacancy untuk pengecekan
  //         let vacancyGet = await Vacancy.findOne({
  //             where: {
  //                 slug: req.params.slug                }
  //         })

  //         //cek apakah data vacancy ada
  //         if (!vacancyGet) {
  //             res.status(404).json(response(404, 'vacancy not found'));
  //             return;
  //         }

  //         await Vacancy.destroy({
  //             where: {
  //                 slug: req.params.slug,
  //             }
  //         })


  //         res.status(200).json(response(200, 'success delete vacancy'));

  //     } catch (err) {
  //         logger.error(`Error : ${err}`);
  //         logger.error(`Error message: ${err.message}`);
  //         res.status(500).json(response(500, 'internal server error', err));
  //         console.log(err);
  //     }
  // }
}