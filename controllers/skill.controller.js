const { response } = require('../helpers/response.formatter');

const { Skill } = require('../models');
const Validator = require("fastest-validator");
const v = new Validator();
const { Op, where } = require('sequelize');
const { generatePagination } = require('../pagination/pagination');

const logger = require('../errorHandler/logger');



module.exports = {
  getSkill: async (req, res) => {
    try {
      let { start_date, end_date, search } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      let skills;
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

      [skills, totalCount] = await Promise.all([
        Skill.findAll({
          where: whereCondition,
          limit: limit,
          offset: offset
        }),
        Skill.count({
          where: whereCondition
        })
      ]);

      const pagination = generatePagination(totalCount, page, limit, '/api/region/provinsi/get');

      res.status(200).json({
        status: 200,
        message: 'success get Skill',
        data: skills,
        pagination: pagination
      });

    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  },
  createSkill: async (req, res) => {
    try {
      const schema = {
        name: 'string|empty:false',
      };

      const validate = v.validate(req.body, schema);
      if (validate.length) {
        return res.status(400).json(response(400, null, validate));
      }

      const { name } = req.body;

      const skill = await Skill.findOne({ where: { name } });
      if (skill) {
        return res.status(400).json(response(400, 'skill already exist'));
      }

      const newSkill = await Skill.create({ name });

      res.status(201).json(response(201, 'success create skill', newSkill));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  },

  getSkillById: async (req, res) => {
    try {
      const skill = await Skill.findByPk(req.params.id);
      if (!skill) {
        return res.status(404).json(response(404, 'skill not found'));
      }
      res.status(200).json(response(200, 'success get skill', skill));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  },

  updateSkill: async (req, res) => {
    try {
      const schema = {
        name: 'string|empty:false',
      };

      const validate = v.validate(req.body, schema);
      if (validate.length) {
        return res.status(400).json(response(400, null, validate));
      }
      
      const { name } = req.body;
      
      let skill = await Skill.findOne({where: { name: req.body.name }});
      if (skill) {
        return res.status(400).json(response(400, 'skill already exist'));
      }

      skill = await Skill.findByPk(req.params.id);
      if (!skill) {
        return res.status(404).json(response(404, 'skill not found'));
      }
      
      await Skill.update({ name }, { where: { id: req.params.id } });

     const skillUpdated = Skill.findByPk(req.params.id);

      res.status(200).json(response(200, 'success update skill', skillUpdated));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  },

  deleteSkill: async (req, res) => {
    try {
      const skill = await Skill.findByPk(req.params.id);
      if (!skill) {
        return res.status(404).json(response(404, 'skill not found'));
      }
      await Skill.destroy({ where: { id: req.params.id } });
      res.status(200).json(response(200, 'success delete skill'));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  }
}