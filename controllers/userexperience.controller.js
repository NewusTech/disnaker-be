const { response } = require('../helpers/response.formatter');

const { User, UserExperience, UserProfile, UserEducationHistory, Role, sequelize, Application, Vacancy, SavedVacancy } = require('../models');

const passwordHash = require('password-hash');
const Validator = require("fastest-validator");
const v = new Validator();
const { Op, where, NUMBER } = require('sequelize');
const { generatePagination } = require('../pagination/pagination');

const logger = require('../errorHandler/logger');


module.exports = {
  createUserExperience: async (req, res) => {
    try {

      // Membuat schema untuk validasi
      const schema = {
        user_id: { type: "number", optional: false },
        title: { type: "string", optional: false, min: 3 },
        possition: { type: "string", optional: false, min: 3 },
        companyName: { type: "string", optional: false, min: 3 },
        contractType: { type: "string", optional: true },
        joinDate: { type: "string", optional: true },
        leaveDate: { type: "string", optional: true },
        isCurrently: { type: "enum", values: ["true", "false"], optional: true },
        desc: { type: "string", optional: true }
      }

      // Buat object user experience
      let userExperienceObj = {
        user_id: auth.userId,
        title: req.body.title,
        possition: req.body.possition,
        companyName: req.body.companyName,
        contractType: req.body.contractType,
        joinDate: req.body.joinDate,
        leaveDate: req.body.leaveDate,
        isCurrently: req.body.isCurrently,
        desc: req.body.desc
      };

      // Validasi menggunakan module fastest-validator
      const validate = v.validate(userExperienceObj, schema);
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

      // create user experience
      let userExperienceCreate = await UserExperience.create(userExperienceObj);

      res.status(200).json(response(200, 'success create user experience', userExperienceCreate));
    } catch (err) {
      logger.error(`Error: ${err}`);
      logger.error(`Error: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  },
  getUserExperience: async (req, res) => {
    try {
      let { search, start_date, end_date } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Kondisi where untuk pencarian dan filter
      const whereCondition = {
        user_id: auth.userId
      };

      if (search) {
        whereCondition[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { companyName: { [Op.iLike]: `%${search}%` } },
          { possition: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (start_date && end_date) {
        whereCondition.createdAt = { [Op.between]: [moment(start_date).startOf('day').toDate(), moment(end_date).endOf('day').toDate()] };
      } else if (start_date) {
        whereCondition.createdAt = { [Op.gte]: moment(start_date).startOf('day').toDate() };
      } else if (end_date) {
        whereCondition.createdAt = { [Op.lte]: moment(end_date).endOf('day').toDate() };
      }

      // Menggunakan Promise.all untuk mendapatkan data dan total count secara paralel
      const [userexperienceGets, totalCount] = await Promise.all([
        UserExperience.findAll({
          where: whereCondition,
          limit: limit,
          offset: offset
        }),
        UserExperience.count({
          where: whereCondition
        })
      ]);

      if (userexperienceGets.length === 0) {
        return res.status(404).json(response(404, 'user experience not found'));
      }

      // Buat pagination
      const pagination = generatePagination(totalCount, page, limit, '/api/userexperience/get');

      res.status(200).json({
        status: 200,
        message: 'success get user experience',
        data: userexperienceGets,
        pagination: pagination
      });
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  },
  getUserExperienceById: async (req, res) => {
    try {
      const whereCondition = {
        id: req.params.id
      };
      if(auth.role === 'User'){
        whereCondition.user_id = auth.userId
      }
      const userexperienceGet = await UserExperience.findOne({
        where: whereCondition
      });
      if (!userexperienceGet) {
        return res.status(404).json(response(404, 'user experience not found'));
      }
      res.status(200).json(response(200, 'success get user experience', userexperienceGet));
    } catch (err) {
      logger.error(`Error: ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  },

  updateUserExperience: async (req, res) => {
    try {

      const whereCondition = {
        id: req.params.id
      }

      if(auth.role === 'User'){
        whereCondition.user_id = auth.userId
      }

      const userexperienceGet = await UserExperience.findOne({
        where: whereCondition
      });

      if (!userexperienceGet) {
        return res.status(404).json(response(404, 'user experience not found'));
      }

      // Membuat schema untuk validasi
      const schema = {
        user_id: { type: "number", optional: false },
        title: { type: "string", optional: false, min: 3 },
        possition: { type: "string", optional: false, min: 3 },
        companyName: { type: "string", optional: false, min: 3 },
        contractType: { type: "string", optional: true },
        joinDate: { type: "string", optional: true },
        leaveDate: { type: "string", optional: true },
        isCurrently: { type: "enum", values: ["true", "false"], optional: true },
        desc: { type: "string", optional: true }
      }

      // Buat object user experience
      let userExperienceObj = {
        user_id: auth.userId,
        title: req.body.title,
        possition: req.body.possition,
        companyName: req.body.companyName,
        contractType: req.body.contractType,
        joinDate: req.body.joinDate,
        leaveDate: req.body.leaveDate,
        isCurrently: req.body.isCurrently,
        desc: req.body.desc
      };

      // Validasi menggunakan module fastest-validator
      const validate = v.validate(userExperienceObj, schema);
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

      // update user experience
      await UserExperience.update(userExperienceObj, {
        where: whereCondition
      });

      const experienceAfterUpdate = await UserExperience.findOne({
        where: whereCondition
      });

      res.status(200).json(response(200, 'success update user experience', experienceAfterUpdate));
    } catch (err) {
      logger.error(`Error: ${err}`);
      logger.error(`Error: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  },

  deleteUserExperience: async (req, res) => {
    try {
      const whereCondition = {
        id: req.params.id
      };

      if(auth.role === 'User'){
        whereCondition.user_id = auth.userId
      }

      const userexperienceDelete = await UserExperience.destroy({
        where: whereCondition
      });

      res.status(200).json(response(200, 'success delete user experience'));
    } catch (err) {
      logger.error(`Error: ${err}`);
      logger.error(`Error: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  }
}