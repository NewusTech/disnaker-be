const { response } = require('../helpers/response.formatter');
const { JobInvitation, Vacancy, User, Company, UserProfile } = require('../models');
const Validator = require("fastest-validator");
const logger = require('../errorHandler/logger');
const v = new Validator();
const moment = require('moment-timezone');
const { generatePagination } = require('../pagination/pagination');
const { Op, where } = require('sequelize');
const vacancy = require('../models/vacancy');

module.exports = {

  //membuat invitation
  invite: async (req, res) => {
    try {

      //membuat schema untuk validasi
      const schema = {
        user_id: { type: "number", min: 1, optional: false },
        vacancy_id: { type: "number", min: 1, optional: false },
        desc: { type: "string", optional: true }
      }

      //buat object invitation
      let invitationCreateObj = {
        user_id: Number(req.body.user_id),
        vacancy_id: parseInt(req.body.vacancy_id),
        desc: req.body.desc
      }

      //validasi menggunakan module fastest-validator
      const validate = v.validate(invitationCreateObj, schema);
      if (validate.length > 0) {
        res.status(400).json(response(400, 'validation failed', validate));
        return;
      }
      invitationCreateObj.status = 'Pending';
      invitationCreateObj.invitationDate = Date.now();
      invitationCreateObj.isReading = 'false';

      //buat invitation
      let invitationCreate = await JobInvitation.create(invitationCreateObj);

      //response menggunakan helper response.formatter
      res.status(201).json(response(201, 'success create invitation', invitationCreate));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  },

  getInvitation: async (req, res) => {
    try {
      let { start_date, end_date, search, status } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      let jobInvitationGets;
      let totalCount;

      const whereCondition = {};
      const whereEmail = {};
      const whereName = {};
      const whereTitle = {};

      if (search) {
        whereEmail[Op.or] = [{ email: { [Op.iLike]: `%${search}%` } }];
        whereName[Op.or] = [{ name: { [Op.iLike]: `%${search}%` } }];
        whereTitle[Op.or] = [{ title: { [Op.iLike]: `%${search}%` } }];
      }

      if (status) {
        whereCondition.status = status;
      }

      if (start_date && end_date) {
        whereCondition.createdAt = { [Op.between]: [moment(start_date).startOf('day').toDate(), moment(end_date).endOf('day').toDate()] };
      } else if (start_date) {
        whereCondition.createdAt = { [Op.gte]: moment(start_date).startOf('day').toDate() };
      } else if (end_date) {
        whereCondition.createdAt = { [Op.lte]: moment(end_date).endOf('day').toDate() };
      }

      [jobInvitationGets, totalCount] = await Promise.all([
        JobInvitation.findAll({
          include: [
            {
              model: User,
              include: [{ model: UserProfile, attributes: ['id', 'name', 'phoneNumber'], where: whereName }],
              attributes: ['id', 'email', 'isActive', 'slug'],
              where: whereEmail
            },
            {
              model: Vacancy, where: whereTitle, attributes: ['id', 'title'],
              include: [
                { model: Company, attributes: ['id', 'name'], where: whereName }
              ]
            }
          ],
          where: whereCondition,
          limit: limit,
          offset: offset,
          attributes: ['id', 'user_id', 'vacancy_id', 'createdAt', 'status', 'updatedAt'],
          order: [['createdAt', 'DESC']]
        }),
        JobInvitation.count({
          where: whereCondition
        })
      ]);
      const pagination = generatePagination(totalCount, limit, page);
      res.status(200).json(response(200, 'success get application', jobInvitationGets, pagination));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  },
  getUserInvitation: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      let jobInvitationGets;
      let totalCount;

      [jobInvitationGets, totalCount] = await Promise.all([
        JobInvitation.findAll({
          where: { user_id: auth.userId },
          include: [{ model: Vacancy, }],
          limit: limit,
          offset: offset,
          attributes: ['id', 'user_id', 'vacancy_id', 'createdAt', 'status', 'isReading', 'updatedAt'],
          order: [['createdAt', 'DESC']]
        }),
        JobInvitation.count({
          where: { user_id: auth.userId }
        })
      ]);

      if (jobInvitationGets.length === 0) {
        return res.status(404).json(response(404, 'user invitation not found'));
      }

      const pagination = generatePagination(totalCount, limit, page);

      return res.status(200).json({
        status: 200,
        message: 'success get user invitation',
        data: jobInvitationGets,
        pagination: pagination
      });
    }
    catch (error) {
      logger.error(`Error : ${error}`);
      logger.error(`Error message: ${error.message}`);
      return res.status(500).json(response(500, 'internal server error', error));
    }
  },

  getUserInvitationById: async (req, res) => {
    try {
      const { id } = req.params;
      const jobInvitationGet = await JobInvitation.findOne({
        where: { id: id, user_id: auth.userId }
      });
      if (!jobInvitationGet) {
        return res.status(404).json(response(404, 'job invitation not found'));
      }
      return res.status(200).json(response(200, 'success get job invitation', jobInvitationGet));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      return res.status(500).json(response(500, 'internal server error', err));
    }
  },

  updateIsReading: async (req, res) => {
    try {
      const { id } = req.params;

      const jobInvitation = await JobInvitation.findByPk(id);

      if (!jobInvitation) {
        return res.status(404).json(response(404, 'job invitation not found'));
      }

      const whereCondition = {
        id: id
      };

      const updateData = {
        isReading: 'true'
      };

      await JobInvitation.update(updateData, {
        where: whereCondition
      });

      return res.status(200).json(response(200, 'success update job invitation'));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      return res.status(500).json(response(500, 'internal server error', err));
    }
  },

  updateInvitation: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const schema = {
        id: { type: "number", min: 1, optional: false },
        status: { type: "enum", values: ["Pending", "Ditolak", "Diterima"], optional: false }
      };

      const obj = {
        id: Number(id),
        status: status
      };

      const validate = v.validate(obj, schema);
      if (validate !== true) {
        return res.status(400).json(response(400, validate));
      }

      const jobInvitation = await JobInvitation.findByPk(id);

      if (!jobInvitation) {
        return res.status(404).json(response(404, 'job invitation not found'));
      }

      const whereCondition = {
        id: id
      };

      const updateData = {
        status: status
      };

      await JobInvitation.update(updateData, {
        where: whereCondition
      });

      res.status(200).json(response(200, 'success update job invitation'));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  }

}