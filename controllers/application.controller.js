const { response } = require('../helpers/response.formatter');
const { Application, Vacancy, User, Company, UserProfile } = require('../models');
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
        user_id: { type: "number", min: 1, optional: false },
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

  getApplication: async (req, res) => {
    try {
      let { start_date, end_date, search, status, instanceName } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      let applicationGets;
      let totalCount;

      const whereCondition = {};
      const whereTitle = {};
      const whereName = {};

      const userRole = auth.role;
      const company = await Company.findOne({ where: { user_id: auth.userId } });

      if (search) {
        whereTitle[Op.or] = [{ title: { [Op.iLike]: `%${search}%` } }];
        whereName[Op.or] = [{ name: { [Op.iLike]: `%${search}%` } }];
      }
      if (status) {
        whereCondition.status = status;
      }
      if (instanceName) {
        whereCondition.name = instanceName;
      }

      if (start_date && end_date) {
        whereCondition.createdAt = { [Op.between]: [moment(start_date).startOf('day').toDate(), moment(end_date).endOf('day').toDate()] };
      } else if (start_date) {
        whereCondition.createdAt = { [Op.gte]: moment(start_date).startOf('day').toDate() };
      } else if (end_date) {
        whereCondition.createdAt = { [Op.lte]: moment(end_date).endOf('day').toDate() };
      }

      [applicationGets, totalCount] = await Promise.all([
        Application.findAll({
          include: [
            {
              model: User,
              include: [{ model: UserProfile, attributes: ['id', 'name', 'phoneNumber'] }],
              attributes: ['id', 'email', 'isActive', 'slug'],
              where: whereName
            },
            {
              model: Vacancy,
              where: whereTitle,
              attributes: ['id', 'title'],
              include: [
                {
                  model: Company,
                  attributes: ['id', 'name'],
                  where: {
                    [Op.and]: [
                      userRole === 'Company' ? { id: company.id } : {},
                      ...whereName[Op.or] ? whereName[Op.or] : []
                    ]
                  }
                }
              ]
            }
          ],
          where: whereCondition,
          limit: limit,
          offset: offset,
          attributes: ['id', 'user_id', 'vacancy_id', 'createdAt', 'status', 'updatedAt'],
          order: [['createdAt', 'DESC']]
        }),
        Application.count({
          where: whereCondition
        })
      ]);

      const pagination = generatePagination(totalCount, limit, page);
      res.status(200).json(response(200, 'success get application', applicationGets, pagination));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  },

  updateApplication: async (req, res) => {
    try {

      const schema = {
        status: { type: "enum", values: ['Dilamar', 'Wawancara', 'Tes', 'Diterima', 'Ditolak'], optional: false },
      }

      const validate = v.validate(req.body, schema);
      if (validate.length > 0) {
        res.status(400).json(response(400, 'validation failed', validate));
        return;
      }

      await Application.update(req.body, {
        where: { id: req.params.id }
      });

      const applicationUpdate = await Application.findOne({
        where: { id: req.params.id }
      })
      res.status(200).json(response(200, 'success update application', applicationUpdate));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  }

}