const { response } = require('../helpers/response.formatter');

const { Vacancy, SavedVacancy } = require('../models');

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
  savevacancy: async (req, res) => {
    try {

      //membuat schema untuk validasi
      const schema = {
        user_id: { type: "number", min: 1, optional: false },
        vacancy_id: { type: "number", min: 1, optional: false }
      }

      //buat object savedVacancy
      let savedVacancyCreateObj = {
        user_id: auth.userId,
        vacancy_id: parseInt(req.body.vacancy_id),
      }

      //validasi menggunakan module fastest-validator
      const validate = v.validate(savedVacancyCreateObj, schema);
      if (validate.length > 0) {
        res.status(400).json(response(400, 'validation failed', validate));
        return;
      }

      //buat savedVacancy
      let savedVacancyCreate = await SavedVacancy.create(savedVacancyCreateObj);

      //response menggunakan helper response.formatter
      res.status(201).json(response(201, 'success create savedVacancy', savedVacancyCreate));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  },

  unsavevacancy: async (req, res) => {
    try {
      //mendapatkan data savedVacancy untuk pengecekan
      let savedVacancyGet = await SavedVacancy.findOne({
        where: {
          user_id: auth.userId,
          vacancy_id: Number(req.body.vacancy_id)
        }
      });

      //cek apakah savedVacancy ada atau tidak
      if (!savedVacancyGet) {
        res.status(404).json(response(404, 'savedVacancy not found'));
      } 

      let savedVacancyDelete = await SavedVacancy.destroy({
        where: {
          user_id: auth.userId,
          vacancy_id: req.body.vacancy_id
        }
      });

      //response menggunakan helper response.formatter
        res.status(200).json(response(200, 'success delete savedVacancy', savedVacancyDelete));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  },

  getsavedVacancy: async (req, res) => {
    try {
      const savedVacancyGets = await SavedVacancy.findAll({
        where: {
          user_id: auth.userId
        },
        include: [{ model: Vacancy }]
      });

      //response menggunakan helper response.formatter
      res.status(200).json(response(200, 'success get savedVacancy', savedVacancyGets));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  },
}