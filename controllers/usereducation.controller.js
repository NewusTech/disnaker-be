const { response } = require('../helpers/response.formatter');

const { User, UserExperience, UserProfile, UserEducationHistory, Role, sequelize, Application, Vacancy, SavedVacancy } = require('../models');

const passwordHash = require('password-hash');
const Validator = require("fastest-validator");
const v = new Validator();
const { Op, where } = require('sequelize');
const { generatePagination } = require('../pagination/pagination');

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const logger = require('../errorHandler/logger');
const vacancy = require('../models/vacancy');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  useAccelerateEndpoint: true
});

module.exports = {
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
  getusereducation: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Kondisi where untuk pencarian dan filter
      const whereCondition = {
        user_id: auth.userId
      };

      // Menggunakan Promise.all untuk mendapatkan data dan total count secara paralel
      const [usereducationGets, totalCount] = await Promise.all([
        UserEducationHistory.findAll({
          where: whereCondition,
          limit: limit,
          offset: offset
        }),
        UserEducationHistory.count({
          where: whereCondition
        })
      ]);

      if (usereducationGets.length === 0) {
        return res.status(404).json(response(404, 'user education not found'));
      }

      // Buat pagination
      const pagination = generatePagination(totalCount, page, limit, '/api/usereducation/get');

      res.status(200).json({
        status: 200,
        message: 'success get user education',
        data: usereducationGets,
        pagination: pagination
      });
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  }

}