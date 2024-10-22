const { response } = require('../helpers/response.formatter');

const { Application, Vacancy, Company, EducationLevel } = require('../models');

const passwordHash = require('password-hash');
const Validator = require("fastest-validator");
const v = new Validator();
const { Op, where } = require('sequelize');
const { generatePagination } = require('../pagination/pagination');

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const logger = require('../errorHandler/logger');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  useAccelerateEndpoint: true
});


module.exports = {
  getUserApplications: async (req, res) => {
    try {
      let { status, search, start_date, end_date } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Kondisi where untuk pencarian, filter status, dan filter tanggal
      let whereCondition = { user_id: auth.userId };

      if (status) {
        whereCondition.status = { [Op.eq]: status };
      }

      if (search) {
        whereCondition[Op.or] = [
          { '$Vacancy.title$': { [Op.iLike]: `%${search}%` } }, // Pencarian pada kolom Vacancy
          { '$Vacancy.description$': { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (start_date && end_date) {
        whereCondition.createdAt = { [Op.between]: [moment(start_date).startOf('day').toDate(), moment(end_date).endOf('day').toDate()] };
      } else if (start_date) {
        whereCondition.createdAt = { [Op.gte]: moment(start_date).startOf('day').toDate() };
      } else if (end_date) {
        whereCondition.createdAt = { [Op.lte]: moment(end_date).endOf('day').toDate() };
      }

      // Query untuk mendapatkan data aplikasi user dengan pagination
      const [userWithApplications, totalCount] = await Promise.all([
        Application.findAll({
          where: whereCondition,
          include: [
            {
              model: Vacancy,
              include: [
                {
                  model: EducationLevel,
                  attributes: ['id', 'level']
                },
                {
                  model: Company,
                }
              ]
            }
          ],
          limit: limit,
          offset: offset
        }),
        Application.count({
          where: whereCondition
        })
      ]);

      if (!userWithApplications || userWithApplications.length === 0) {
        return res.status(404).json(response(404, 'Applications not found'));
      }

      // Buat pagination
      const pagination = generatePagination(totalCount, page, limit, '/api/userapplications/get');

      // Success response
      res.status(200).json({
        status: 200,
        message: 'success get user with Applications',
        data: userWithApplications,
        pagination: pagination
      });
    } catch (error) {
      // Log error details dan kirimkan response error 500
      logger.error(`Error : ${error}`);
      logger.error(`Error message: ${error.message}`);
      console.error('Error fetching user applications:', error);
      res.status(500).json(response(500, 'internal server error', error));
    }
  }
}