const { response } = require('../helpers/response.formatter');

const { SurveyKepuasan, User, UserProfile } = require('../models');
const Validator = require("fastest-validator");
const v = new Validator();
const { Op, where } = require('sequelize');
const { generatePagination } = require('../pagination/pagination');
const logger = require('../errorHandler/logger');


module.exports = {
  getSkm: async (req, res) => {
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
        SurveyKepuasan.findAll({
          include: [{ 
            attributes: ['id', 'email'],
            model: User,
            include: [
              {
                model: UserProfile,
                attributes: ['name', 'nik']
              }
            ]
           }],
          where: whereCondition,
          limit: limit,
          offset: offset
        }),
        SurveyKepuasan.count({
          where: whereCondition
        })
      ]);

      const pagination = generatePagination(totalCount, page, limit, '/api/s get skm/get');

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
}