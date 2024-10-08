const { response } = require('../helpers/response.formatter');
const { Application, Vacancy, User, Company } = require('../models');
const slugify = require('slugify');
const Validator = require("fastest-validator");
const logger = require('../errorHandler/logger');
const v = new Validator();
const moment = require('moment-timezone');
const { generatePagination } = require('../pagination/pagination');
const { Op } = require('sequelize');
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
  
}