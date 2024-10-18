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
      const company = await Company.findOne({
        where: { user_id: auth.userId }
      });

      // Mendapatkan semua atribut dari company dan mengecek kekosongan field yang wajib
      const requiredFields = ['user_id', 'department', 'name', 'desc', 'address', 'numberEmployee', 'website', 'instagram', 'imageLogo', 'imageBanner'];
      const missingFields = requiredFields.filter(field => !company[field]);

      if (missingFields.length > 0) {
        return res.status(400).json(response(400, `Company Profile tidak lengkap. Silahkan lengkapi field: ${missingFields.join(', ')}`));
      }
      //membuat schema untuk validasi
      const schema = {
        title: { type: "string", min: 3 },
        desc: { type: "string", min: 3, optional: true },
        jobType: { type: "enum", values: ['Full Time', 'Part Time', 'Freelance'], optional: true },
        workLocation: { type: "enum", values: ['Onsite', 'Remote', 'Hybrid'], optional: true },
        category_id: { type: "number", optional: true },
        salary: { type: "number", optional: true },
        workingDay: { type: "string", optional: true },
        workingHour: { type: "string", optional: true },
        minExperience: { type: "number", optional: true },
        applicationDeadline: { type: "string", optional: true },
        gender: { type: "string", optional: true },
        maxAge: { type: "number", optional: true },
        location: { type: "string", optional: true },
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
        location: req.body.location,
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
      let {
        start_date, end_date, search, status, category_id, workLocation, jobType, educationLevel_id
      } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      let vacancyGets;
      let totalCount;

      const whereCondition = {};
      const whereCategory = {};
      const whereEducationLevel = {};

      if (category_id) {
        whereCategory.id = { [Op.eq]: Number(category_id) };
      }
      if (educationLevel_id) {
        whereEducationLevel.id = { [Op.eq]: Number(educationLevel_id) };
      }
      if (workLocation) {
        whereCondition.workLocation = { [Op.eq]: workLocation };
      }
      if (jobType) {
        whereCondition.jobType = { [Op.eq]: jobType };
      }
      if (search) {
        whereCondition[Op.or] = [{ title: { [Op.iLike]: `%${search}%` } }];
      }
      if (status) {
        whereCondition.isPublished = { [Op.eq]: status === 'published' ? 'true' : 'false' };
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
          attributes: ['id', 'title', 'slug', 'workLocation', 'jobType', 'desc', 'applicationDeadline', 'salary', 'location', 'isPublished', 'createdAt', 'updatedAt'],
          include: [
            { model: EducationLevel, attributes: ['id', 'level'] },
            { model: Company, attributes: ['id', 'name', 'imageLogo'] },
            {
              model: VacancyCategory, attributes: ['id', 'name'], where: whereCategory
            },
          ],
          where: whereCondition,
          limit: limit,
          offset: offset,
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
      let { search } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      let categoryGets;
      let totalCount;

      const whereCondition = {};
      const whereSearch = {};

      if (search) {
        whereSearch[Op.or] = [{ name: { [Op.iLike]: `%${search}%` } }, { nik: { [Op.iLike]: `%${search}%` } }];
      }

      [categoryGets, totalCount] = await Promise.all([
        VacancyCategory.findAll({
          limit: limit,
          offset: offset,
          order: [['id', 'ASC']],
          where: whereCondition,
        }),
        VacancyCategory.count({
          where: whereCondition
        })
      ]);

      const pagination = generatePagination(totalCount, page, limit, '/api/vacancy/category/get');

      res.status(200).json({
        status: 200,
        message: 'success get',
        data: categoryGets,
        pagination: pagination
      });

    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  },

  getvacancyinvitations: async (req, res) => {
    try {
      let {
        start_date, end_date, search, status, category_id, workLocation, jobType, educationLevel_id
      } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      let vacancyGets;
      let totalCount;

      const whereCondition = {};
      const whereCategory = {};
      const whereEducationLevel = {};

      if (category_id) {
        whereCategory.id = { [Op.eq]: Number(category_id) };
      }
      if (educationLevel_id) {
        whereEducationLevel.id = { [Op.eq]: Number(educationLevel_id) };
      }
      if (workLocation) {
        whereCondition.workLocation = { [Op.eq]: workLocation };
      }
      if (jobType) {
        whereCondition.jobType = { [Op.eq]: jobType };
      }
      if (search) {
        whereCondition[Op.or] = [{ title: { [Op.iLike]: `%${search}%` } }];
      }
      if (status) {
        whereCondition.isPublished = { [Op.eq]: status === 'published' ? 'true' : 'false' };
      }

      if (start_date && end_date) {
        whereCondition.createdAt = { [Op.between]: [moment(start_date).startOf('day').toDate(), moment(end_date).endOf('day').toDate()] };
      } else if (start_date) {
        whereCondition.createdAt = { [Op.gte]: moment(start_date).startOf('day').toDate() };
      } else if (end_date) {
        whereCondition.createdAt = { [Op.lte]: moment(end_date).endOf('day').toDate() };
      }

      const company = await Company.findOne({ where: { user_id: auth.userId } });
      switch (auth.roleId) {
        case 1:
          console.log('role 1')
          whereCondition.company_id = { [Op.eq]: company.id };
          break;
        case 2:
          console.log('role 2')
          whereCondition.isPublished = { [Op.eq]: 'true' };
          break;
        case 3:
          console.log('role 3')
          whereCondition.company_id = { [Op.eq]: company.id };
          break;
        default:
          break;
      }

      [vacancyGets, totalCount] = await Promise.all([
        Vacancy.findAll({
          attributes: ['id', 'title', 'slug', 'workLocation', 'jobType', 'desc', 'applicationDeadline', 'salary', 'location', 'isPublished', 'createdAt', 'updatedAt'],
          where: whereCondition,
          limit: limit,
          offset: offset,
        }),
        Vacancy.count({
          where: whereCondition
        })
      ]);

      if (vacancyGets.length === 0) {
        res.status(404).json(response(404, 'vacancy not found'));
        return;
      }

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
        where: whereCondition,
        include: [
          { model: Company, attributes: ['id', 'name', 'imageLogo', 'imageBanner', 'desc', 'address', 'numberEmployee', 'website', 'instagram'] },
          { model: VacancyCategory, attributes: ['id', 'name'] },
          { model: EducationLevel },
          { model: Skill, through: { attributes: [] } },
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
  },

  updateVacancy: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {

      if (auth.role === 'Company') {
        const company = await Company.findOne({ where: { user_id: auth.userId }, attributes: ['id', 'user_id'] });
        if (!company) {
          return res.status(404).json(response(404, 'Company not found'));
        }
      }

      // Cari vacancy berdasarkan id yang dikirim dari request
      const vacancy = await Vacancy.findOne({ where: { slug: req.params.slug } });

      if (!vacancy) {
        return res.status(404).json(response(404, 'Vacancy not found'));
      }

      // Skema validasi yang sama seperti create
      const schema = {
        title: { type: "string", min: 3, optional: true },
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
        location: { type: "string", optional: true },
        responsibility: { type: "string", min: 3, optional: true },
        requirement: { type: "string", min: 3, optional: true },
        status: { type: "string", optional: true },
        skills: { type: "array", optional: true },
        educationLevels: { type: "array", optional: true },
      }

      // Buat object untuk update vacancy
      let vacancyUpdateObj = {
        title: req.body.title,
        jobType: req.body.jobType,
        workLocation: req.body.workLocation,
        skills: req.body.skills,
        minExperience: req.body.minExperience !== undefined ? Number(req.body.minExperience) : vacancy.minExperience,
        educationLevels: req.body.educationLevels,
        salary: req.body.salary !== undefined ? Number(req.body.salary) : vacancy.salary,
        workingDay: req.body.workingDay,
        workingHour: req.body.workingHour,
        gender: req.body.gender,
        maxAge: req.body.maxAge !== undefined ? Number(req.body.maxAge) : vacancy.maxAge,
        applicationDeadline: req.body.applicationDeadline || vacancy.applicationDeadline,
        slug: req.body.title ? slugify(req.body.title, { lower: true }) + '-' + new Date().getTime() : vacancy.slug,
        desc: req.body.desc,
        isPublished: req.body.status || vacancy.isPublished,
        location: req.body.location,
        responsibility: req.body.responsibility,
        requirement: req.body.requirement,
        category_id: req.body.category_id !== undefined ? Number(req.body.category_id) : vacancy.category_id,
      }

      // Validasi menggunakan module fastest-validator
      const validate = v.validate(vacancyUpdateObj, schema);
      if (validate.length > 0) {
        res.status(400).json(response(400, 'validation failed', validate));
        return;
      }

      // Update vacancy
      await vacancy.update(vacancyUpdateObj);

      // Hapus skill dan education level lama
      await VacancySkill.destroy({ where: { vacancy_id: vacancy.id } });
      await VacancyEducationLevel.destroy({ where: { vacancy_id: vacancy.id } });

      // Update skill jika ada
      if (vacancyUpdateObj.skills) {
        vacancyUpdateObj.skills.forEach(async (skill) => {
          await VacancySkill.create({
            skill_id: skill,
            vacancy_id: vacancy.id,
          });
        });
      }

      // Update education level jika ada
      if (vacancyUpdateObj.educationLevels) {
        vacancyUpdateObj.educationLevels.forEach(async (educationLevel) => {
          await VacancyEducationLevel.create({
            educationLevel_id: educationLevel,
            vacancy_id: vacancy.id,
          });
        });
      }

      await transaction.commit();
      // Response menggunakan helper response.formatter
      res.status(200).json(response(200, 'Vacancy updated successfully', vacancy));
    } catch (err) {
      await transaction.rollback();
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  },

  deleteVacancy: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      // Mendapatkan data vacancy berdasarkan slug
      let vacancy = await Vacancy.findOne({
        where: { slug: req.params.slug }
      });

      // Cek apakah vacancy ada
      if (!vacancy) {
        res.status(404).json(response(404, 'Vacancy not found'));
        return;
      }

      // Hapus semua entri di VacancySkill yang berhubungan dengan vacancy ini
      await VacancySkill.destroy({
        where: { vacancy_id: vacancy.id },
        transaction: transaction
      });

      await VacancyEducationLevel.destroy({
        where: { vacancy_id: vacancy.id },
        transaction: transaction
      });

      // Hapus vacancy setelah relasi dihapus
      await Vacancy.destroy({
        where: { slug: req.params.slug },
        transaction: transaction
      });

      await transaction.commit();
      res.status(200).json(response(200, 'Success delete vacancy'));
    } catch (err) {
      await transaction.rollback();
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'Internal server error', err));
    }
  }

}