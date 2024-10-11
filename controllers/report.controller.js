const { response } = require('../helpers/response.formatter');

const { Vacancy, Company, VacancyCategory, Application } = require('../models');
const Validator = require("fastest-validator");
const v = new Validator();
const { Op, where } = require('sequelize');
const { generatePagination } = require('../pagination/pagination');

const logger = require('../errorHandler/logger');


module.exports = {
  getReport: async (req, res) => {
    try {
      let { start_date, end_date, search } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      let vacancyGets;
      let totalCount;

      const whereCondition = {};

      if (search) {
        whereCondition[Op.or] = [{ title: { [Op.iLike]: `%${search}%` } }];
      }

      if (start_date && end_date) {
        whereCondition.createdAt = { [Op.between]: [moment(start_date).startOf('day').toDate(), moment(end_date).endOf('day').toDate()] };
      } else if (start_date) {
        whereCondition.createdAt = { [Op.gte]: moment(start_date).startOf('day').toDate() };
      } else if (end_date) {
        whereCondition.createdAt = { [Op.lte]: moment(end_date).endOf('day').toDate() };
      }

      [vacancyGets, totalCount] = await Promise.all([
        Vacancy.findAll({
          include: [{ model: Company }, { model: Application }, { model: VacancyCategory }],
          where: whereCondition,
          limit: limit,
          offset: offset
        }),
        Vacancy.count({
          where: whereCondition
        })
      ]);

      const pagination = generatePagination(totalCount, page, limit, '/api/report/get');

      const formattedResponse = vacancyGets.map(vacancy => {
        return {
          id: vacancy.id,
          title: vacancy.title,
          category: vacancy.VacancyCategory.name,
          companyName: vacancy.Company.name,
          appliedCount: vacancy.Applications.filter(app => app.status === 'Dilamar').length,
          interviewCount: vacancy.Applications.filter(app => app.status === 'Wawancara').length,
          testCount: vacancy.Applications.filter(app => app.status === 'Tes').length,
          acceptCount: vacancy.Applications.filter(app => app.status === 'Diterima').length,
          rejectCount: vacancy.Applications.filter(app => app.status === 'Ditolak').length,
          applicationCount: vacancy.Applications.length
        }
      })
      res.status(200).json({
        status: 200,
        message: 'success get Laporan',
        data: formattedResponse,
        pagination: pagination
      });

    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  }
}