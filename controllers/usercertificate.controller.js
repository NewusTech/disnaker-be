const { response } = require('../helpers/response.formatter');

const { UserCertificate, User } = require('../models');

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
  createUserCertificate: async (req, res) => {
    try {
      let schema = {
        user_id: { type: "number", optional: false },
        name: { type: "string", optional: true },
        organization: { type: "string", optional: true },
        file: { type: "string", optional: true },
        expiredDate: { type: "string", optional: true },
        isNonExpire: { type: "string", optional: true },
        desc: { type: "string", optional: true }
      }
      const objCreate = {
        user_id: auth.userId,
        name: req.body.title,
        organization: req.body.organization,
        file: req.body.file,
        expiredDate: req.body.expiredDate,
        isNonExpire: req.body.isNonExpire,
        desc: req.body.desc
      }
      const validate = v.validate(objCreate, schema);
      if (validate.length > 0) {
        return res.status(400).json(response(400, 'validation failed', validate));
      }

      if (req.file) {
        const timestamp = new Date().getTime();
        const uniqueFileName = `${timestamp}-${req.file.originalname}`;

        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: `${process.env.PATH_AWS}/cetificate/${uniqueFileName}`,
          Body: req.file.buffer,
          ACL: 'public-read',
          ContentType: req.file.mimetype
        };

        const command = new PutObjectCommand(uploadParams);

        await s3Client.send(command);

        objCreate.file = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
      }

      const create = await UserCertificate.create(objCreate);

      return res.status(201).json({
        status: true,
        message: 'Create User Certificate Success',
        data: create
      });
    } catch (error) {
      logger.error(`Error : ${error}`);
      logger.error(`Error message: ${error.message}`);
      console.error('Error creating user certificate:', error);
      return res.status(500).json({
        status: false,
        message: 'Internal Server Error'
      });
    }
  },
  getUserUserCertificates: async (req, res) => {
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
          { '$UserCertificate.title$': { [Op.iLike]: `%${search}%` } }, // Pencarian pada kolom UserCertificate
          { '$UserCertificate.description$': { [Op.iLike]: `%${search}%` } }
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
      const [userWithUserCertificates, totalCount] = await Promise.all([
        UserCertificate.findAll({
          where: whereCondition,
          limit: limit,
          offset: offset
        }),
        UserCertificate.count({
          where: whereCondition
        })
      ]);

      if (!userWithUserCertificates || userWithUserCertificates.length === 0) {
        return res.status(404).json(response(404, 'UserCertificates not found'));
      }

      // Buat pagination
      const pagination = generatePagination(totalCount, page, limit, '/api/userapplications/get');

      // Success response
      res.status(200).json({
        status: 200,
        message: 'success get user with UserCertificates',
        data: userWithUserCertificates,
        pagination: pagination
      });
    } catch (error) {
      // Log error details dan kirimkan response error 500
      logger.error(`Error : ${error}`);
      logger.error(`Error message: ${error.message}`);
      console.error('Error fetching user applications:', error);
      res.status(500).json(response(500, 'internal server error', error));
    }
  },

  getUserUserCertificatesById: async (req, res) => {
    try {
      const whereCondition = {
        id: req.params.id
      };
      const usercertificate = await UserCertificate.findOne({
        where: whereCondition
      });
      if (!usercertificate) {
        return res.status(404).json(response(404, 'user certificate not found'));
      }
      res.status(200).json(response(200, 'success get user certificate', usercertificate));
    } catch (err) {
      logger.error(`Error: ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  },

}