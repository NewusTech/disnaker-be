const { response } = require('../helpers/response.formatter');
const { sequelize, Vacancy, VacancyCategory, EducationLevel, VacancyEducationLevel, Company, VacancySkill, Skill } = require('../models');
const slugify = require('slugify');
const Validator = require("fastest-validator");
const logger = require('../errorHandler/logger');
const v = new Validator();
const moment = require('moment-timezone');
const { generatePagination } = require('../pagination/pagination');
const { Op } = require('sequelize');
const company = require('../models/company');

module.exports = {

  // membuat vacancy
  createvacancy: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const company = await Company.findOne({ where: { user_id: auth.userId }, attributes: ['id', 'user_id'] });

      //membuat schema untuk validasi
      const schema = {
        title: { type: "string", min: 3 },
        desc: { type: "string", min: 3, optional: true },
        jobType: { type: "string", optional: true },
        workLocation: { type: "string", optional: true },
        category_id: { type: "number", optional: true },
        salary: { type: "number", optional: true },
        workingDay: { type: "string", optional: true },
        workingHour: { type: "string", optional: true },
        minExperience: { type: "number", optional: true },
        applicationDeadline: { type: "string", optional: true },
        gender: { type: "string", optional: true },
        maxAge: { type: "number", optional: true },
        responsibility: { type: "string", min: 3, optional: true },
        requirement: { type: "string", min: 3, optional: true },
        status: { type: "string", optional: true },
        skills: { type: "array", optional: true },
        educationLevels: { type: "array", optional: true },
      }

      //buat object vacancy
      let vacancyCreateObj = {
        title: req.body.title,
        jobType: req.body.jobType,
        workLocation: req.body.workLocation,
        skills: req.body.skills,
        minExperience: Number(req.body.minExperience),
        educationLevels: req.body.educationLevels,
        salary: Number(req.body.salary),
        workingDay: req.body.workingDay,
        workingHour: req.body.workingHour,
        gender: req.body.gender,
        maxAge: Number(req.body.maxAge),
        applicationDeadline: req.body.applicationDeadline,
        slug: req.body.title ? slugify(req.body.title, { lower: true }) + '-' + new Date().getTime() : null,
        desc: req.body.desc,
        isPublished: req.body.status,
        responsibility: req.body.responsibility,
        requirement: req.body.requirement,
        company_id: company.id,
        category_id: req.body.category_id !== undefined ? Number(req.body.category_id) : null,
      }

      //validasi menggunakan module fastest-validator
      const validate = v.validate(vacancyCreateObj, schema);
      if (validate.length > 0) {
        res.status(400).json(response(400, 'validation failed', validate));
        return;
      }

      //buat vacancy
      let vacancyCreate = await Vacancy.create(vacancyCreateObj);

      if (vacancyCreate) {
        vacancyCreateObj.skills.forEach(async (skill) => {
          await VacancySkill.create({
            skill_id: skill,
            vacancy_id: vacancyCreate.id,
          });
        });

        vacancyCreateObj.educationLevels.forEach(async (educationLevel) => {
          await VacancyEducationLevel.create({
            educationLevel_id: educationLevel,
            vacancy_id: vacancyCreate.id,
          });
        });
      }
      await transaction.commit();
      //response menggunakan helper response.formatter
      res.status(201).json(response(201, 'success create vacancy', vacancyCreate));
    } catch (err) {
      await transaction.rollback();
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));

      console.log(err);
    }
  },

  // mendapatkan semua data vacancy

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

      switch (auth.roleId) {
        case 1:
          break;
        case 2:
          whereCondition.isPublished = { [Op.eq]: 'true' };
          break;
        case 3:
          const company = await Company.findOne({ where: { user_id: auth.userId } });
          whereCondition.company_id = { [Op.eq]: company.id };
          break;
        default:
          break;
      }

      [vacancyGets, totalCount] = await Promise.all([
        Vacancy.findAll({
          attributes: ['id', 'title', 'slug',  'workLocation', 'jobType', 'desc', 'applicationDeadline', 'salary', 'location', 'isPublished', 'createdAt', 'updatedAt'],
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
  getvacancycategories: async (req, res) => {
    try {
      const vacancycategories = await VacancyCategory.findAll({attributes: ['id', 'name']});
      res.status(200).json(response(200, 'success get vacancycategories', vacancycategories));
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
        where: whereCondition,
        include: [
          { model: Company, attributes: ['id', 'name', 'imageLogo', 'imageBanner', 'desc', 'address', 'numberEmployee', 'website', 'instagram'] },
          { model: VacancyCategory, attributes: ['id', 'name'] },
          {
            attributes: ['id', 'educationLevel_id', 'vacancy_id'],
            model: VacancyEducationLevel,
            include: [{ model: EducationLevel }]
          },
          {
            model: VacancySkill,
            attributes: ['id', 'vacancy_id', 'skill_id'],
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

  updatevacancystatus: async (req, res) => {
    try {
      const schema = {
        status: { type: 'string', optional: false },
        vacancy_id: { type: 'number', optional: false }
      }
      const vacancyCreateObj = {
        status: req.body.status,
        vacancy_id: Number(req.body.vacancy_id)
      }

      const validate = v.validate(vacancyCreateObj, schema);
      if (validate.length > 0) {
        res.status(400).json(response(400, 'validation failed', validate));
        return;
      }

      const whereCondition = { slug: req.params.slug };
      //mendapatkan data vacancy untuk pengecekan
      let vacancyGet = await Vacancy.findOne({
        where: whereCondition
      });

      //cek apakah data vacancy ada
      if (!vacancyGet) {
        res.status(404).json(response(404, 'vacancy not found'));
        return;
      }

      await Vacancy.update({ isPublished: req.body.status }, { where: whereCondition });

      res.status(200).json(response(200, 'success update vacancy status'));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  }

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