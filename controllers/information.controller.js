const { response } = require('../helpers/response.formatter');

const { Information, User, UserProfile } = require('../models');
const Validator = require("fastest-validator");
const v = new Validator();
const { Op, where } = require('sequelize');
const { generatePagination } = require('../pagination/pagination');
const logger = require('../errorHandler/logger');
const { default: slugify } = require('slugify');


module.exports = {
  getInformation: async (req, res) => {
    try {
      let { start_date, end_date, search } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      let surveyGets;
      let totalCount;

      const whereCondition = {};

      if (search) {
        whereCondition[Op.or] = [{ name: { [Op.iLike]: `%${search}%` } }];
      }

      if (start_date && end_date) {
        whereCondition.createdAt = { [Op.between]: [moment(start_date).startOf('day').toDate(), moment(end_date).endOf('day').toDate()] };
      } else if (start_date) {
        whereCondition.createdAt = { [Op.gte]: moment(start_date).startOf('day').toDate() };
      } else if (end_date) {
        whereCondition.createdAt = { [Op.lte]: moment(end_date).endOf('day').toDate() };
      }

      [surveyGets, totalCount] = await Promise.all([
        Information.findAll({
          where: whereCondition,
          limit: limit,
          offset: offset
        }),
        Information.count({
          where: whereCondition
        })
      ]);

      const pagination = generatePagination(totalCount, page, limit, '/api/information/get');

      res.status(200).json({
        status: 200,
        message: 'success get skm',
        data: surveyGets,
        pagination: pagination
      });

    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  },

  getById: async (req, res) => {
    try {
      const information = await Information.findOne({ where: { id: req.params.id } });
      if (!information) {
        return res.status(404).json(response(404, 'information not found'));
      }
      res.status(200).json(response(200, 'success get information', information));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  },

  createInformation: async (req, res) => {
    try {

      const schema = {
        title: { type: "string", min: 1, optional: false },
        desc: { type: "string", min: 1, optional: false },
      }

      const obj = {
        title: req.body.title,
        desc: req.body.desc
      }

      const validate = v.validate(obj, schema);
      if (validate.length) {
        return res.status(400).json(response(400, null, validate));
      }

      obj.slug = slugify(req.body.title);

      const information = await Information.create(obj);

      res.status(201).json(response(201, 'success create information', information));

    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  },

  updateInformation: async (req, res) => {
    try {
      const informationExist = await Information.findOne({ where: { id: req.params.id } });
      if (!informationExist) {
        return res.status(404).json(response(404, 'information not found'));
      }

      const schema = {
        title: { type: "string", min: 1, optional: false },
        desc: { type: "string", min: 1, optional: false },
      }

      const obj = {
        title: req.body.title,
        desc: req.body.desc
      }

      const validate = v.validate(obj, schema);
      if (validate.length) {
        return res.status(400).json(response(400, null, validate));
      }

      obj.slug = slugify(req.body.title, { lower: true, strict: true });

      await Information.update(obj, { where: { id: req.params.id } });

      const information = await Information.findOne({ where: { id: req.params.id } });

      res.status(201).json(response(201, 'success create information', information));

    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  },

  delete: async (req, res) => {
    try {
      const information = await Information.findByPk(req.params.id);
      if (!information) {
        return res.status(404).json(response(404, 'information not found'));
      }
      await Information.destroy({ where: { id: req.params.id } });
      res.status(200).json(response(200, 'success delete information'));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  }
}