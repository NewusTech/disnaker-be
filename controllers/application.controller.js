const { response } = require('../helpers/response.formatter');
const { Application, Vacancy, User, Company } = require('../models');
const slugify = require('slugify');
const Validator = require("fastest-validator");
const logger = require('../errorHandler/logger');
const v = new Validator();
const moment = require('moment-timezone');
const { generatePagination } = require('../pagination/pagination');
const { Op } = require('sequelize');
const { auth_secret } = require('../config/base.config');
const vacancy = require('../models/vacancy');

module.exports = {

  //membuat application
  createapplication: async (req, res) => {
      try {

          //membuat schema untuk validasi
          const schema = {
              user_id: { type: "number", min: 1 , optional: false },
              vacancy_id: { type: "number", min: 1, optional: false }
          }

          //buat object application
          let applicationCreateObj = {
              user_id: auth.userId,
              vacancy_id: parseInt(req.body.vacancy_id),
            }

          //validasi menggunakan module fastest-validator
          const validate = v.validate(applicationCreateObj, schema);
          if (validate.length > 0) {
              res.status(400).json(response(400, 'validation failed', validate));
              return;
          }
          applicationCreateObj.status = 'Dilamar';

          console.log(applicationCreateObj)
          console.log(auth)

          //buat application
          let applicationCreate = await Application.create(applicationCreateObj);

          //response menggunakan helper response.formatter
          res.status(201).json(response(201, 'success create application', applicationCreate));
      } catch (err) {
          logger.error(`Error : ${err}`);
          logger.error(`Error message: ${err.message}`);
          res.status(500).json(response(500, 'internal server error', err));
      }
  },

  //mendapatkan semua data application
  // getapplication: async (req, res) => {
  //   try {
  //     let { start_date, end_date, search } = req.query;
  //     const page = parseInt(req.query.page) || 1;
  //     const limit = parseInt(req.query.limit) || 10;
  //     const offset = (page - 1) * limit;
  //     let applicationGets;
  //     let totalCount;

  //     const whereCondition = {};

  //     if (search) {
  //       whereCondition[Op.or] = [{ title: { [Op.iLike]: `%${search}%` } }];
  //     }

  //     if (start_date && end_date) {
  //       whereCondition.createdAt = { [Op.between]: [moment(start_date).startOf('day').toDate(), moment(end_date).endOf('day').toDate()] };
  //     } else if (start_date) {
  //       whereCondition.createdAt = { [Op.gte]: moment(start_date).startOf('day').toDate() };
  //     } else if (end_date) {
  //       whereCondition.createdAt = { [Op.lte]: moment(end_date).endOf('day').toDate() };
  //     }

  //     if (auth.roleId === 2) {
  //       whereCondition.isPublished = { [Op.eq]: 'true' };
  //       console.log('Role: ', auth.roleId);
  //     }
  //     [applicationGets, totalCount] = await Promise.all([

  //       await User.findOne({
  //         where: { id: userId },
  //         include: [{
  //           model: Application,
  //           include: [Vacancy],  // Include Vacancy pada Application
  //         }]
  //       });
  //       Application.findAll({
  //         include: [
  //           { model: Vacancy, attributes: ['id', 'title'] }
  //         ],
  //         where: whereCondition,
  //         limit: limit,
  //         offset: offset
  //       }),
  //       Application.count({
  //         where: whereCondition
  //       })
  //     ]);

  //     const pagination = generatePagination(totalCount, page, limit, '/api/application/get');

  //     res.status(200).json({
  //       status: 200,
  //       message: 'success get application',
  //       data: applicationGets,
  //       pagination: pagination
  //     });

  //   } catch (err) {
  //     logger.error(`Error : ${err}`);
  //     logger.error(`Error message: ${err.message}`);
  //     res.status(500).json(response(500, 'internal server error', err));
  //     console.log(err);
  //   }
  // },

  //mendapatkan data application berdasarkan slug
  // getapplicationBySlug: async (req, res) => {
  //   try {
  //     const whereCondition = { slug: req.params.slug };

  //     //mendapatkan data application berdasarkan slug
  //     let applicationGet = await Application.findOne({
  //       attributes: ['id', 'title', 'slug', 'workLocation', 'jobType', 'desc', 'applicationDeadline', 'isPublished', 'createdAt', 'updatedAt'],
  //       include: [
  //         { model: Company, attributes: ['id', 'name', 'imageLogo', 'imageBanner', 'desc', 'address', 'numberEmployee', 'website', 'instagram'] }
  //       ],
  //       where: whereCondition,
  //     });

  //     //cek jika application tidak ada
  //     if (!applicationGet) {
  //       res.status(404).json(response(404, 'application not found'));
  //       return;
  //     }

  //     //response menggunakan helper response.formatter
  //     res.status(200).json(response(200, 'success get application by slug', applicationGet));
  //   } catch (err) {
  //     logger.error(`Error : ${err}`);
  //     logger.error(`Error message: ${err.message}`);
  //     res.status(500).json(response(500, 'internal server error', err));
  //     console.log(err);
  //   }
  // },

  //mengupdate application berdasarkan slug
  // updateapplication: async (req, res) => {
  //     try {
  //         //mendapatkan data application untuk pengecekan
  //         let applicationGet = await Application.findOne({
  //             where: {
  //                 slug: req.params.slug,
  //             }
  //         })

  //         //cek apakah data application ada
  //         if (!applicationGet) {
  //             res.status(404).json(response(404, 'application not found'));
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

  //         //buat object application
  //         let applicationUpdateObj = {
  //             title: req.body.title ?? applicationGet.title,
  //             slug: req.body.title ? slugify(req.body.title, { lower: true }) : applicationGet.slug,
  //             desc: req.body.desc ?? applicationGet.desc,
  //             image: req.files.image ? imageKey : applicationGet.image,
  //             mediaLink: req.files.mediaLink ? mediaLink : applicationGet.mediaLink,
  //             kategori_id: req.body.kategori_id !== undefined ? Number(req.body.kategori_id) : applicationGet.kategori_id,
  //         }

  //         //validasi menggunakan module fastest-validator
  //         const validate = v.validate(applicationUpdateObj, schema);
  //         if (validate.length > 0) {
  //             res.status(400).json(response(400, 'validation failed', validate));
  //             return;
  //         }

  //         //update application
  //         await Application.update(applicationUpdateObj, {
  //             where: {
  //                 slug: req.params.slug,
  //             }
  //         })

  //         //mendapatkan data application setelah update
  //         let applicationAfterUpdate = await Application.findOne({
  //             where: {
  //                 slug: req.params.slug,
  //             }
  //         })

  //         //response menggunakan helper response.formatter
  //         res.status(200).json(response(200, 'success update application', applicationAfterUpdate));

  //     } catch (err) {
  //         logger.error(`Error : ${err}`);
  //         logger.error(`Error message: ${err.message}`);
  //         res.status(500).json(response(500, 'internal server error', err));
  //         console.log(err);
  //     }
  // },

  //menghapus application berdasarkan slug
  // deleteapplication: async (req, res) => {
  //     try {

  //         //mendapatkan data application untuk pengecekan
  //         let applicationGet = await Application.findOne({
  //             where: {
  //                 slug: req.params.slug                }
  //         })

  //         //cek apakah data application ada
  //         if (!applicationGet) {
  //             res.status(404).json(response(404, 'application not found'));
  //             return;
  //         }

  //         await Application.destroy({
  //             where: {
  //                 slug: req.params.slug,
  //             }
  //         })


  //         res.status(200).json(response(200, 'success delete application'));

  //     } catch (err) {
  //         logger.error(`Error : ${err}`);
  //         logger.error(`Error message: ${err.message}`);
  //         res.status(500).json(response(500, 'internal server error', err));
  //         console.log(err);
  //     }
  // }
}