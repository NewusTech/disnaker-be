const { response } = require('../helpers/response.formatter');

const { Facility, Company, VacancyCategory } = require('../models');

const passwordHash = require('password-hash');
const Validator = require("fastest-validator");
const v = new Validator();
const { Op } = require('sequelize');
const { generatePagination } = require('../pagination/pagination');

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const logger = require('../errorHandler/logger');
const company = require('../models/company');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  useAccelerateEndpoint: true
});


module.exports = {
  createFacility: async (req, res) => {
    try {
      // Schema validasi untuk facility

      let schema = {
        title: { type: "string", optional: false },
        image: { type: "string", optional: true }
      };

      // Objek untuk membuat data facility
      const obj = {
        title: req.body.title,
      };

      // Validasi input
      const validate = v.validate(obj, schema);
      if (validate.length > 0) {
        return res.status(400).json(response(400, 'validation failed', validate));
      }

      // Jika ada file gambar yang di-upload
      if (req.file) {
        const timestamp = new Date().getTime();
        const uniqueFileName = `${timestamp}-${req.file.originalname}`;

        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: `${process.env.PATH_AWS}/facilitys/${uniqueFileName}`,
          Body: req.file.buffer,
          ACL: 'public-read',
          ContentType: req.file.mimetype
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // Menyimpan URL gambar setelah upload
        obj.image = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
      }

      // Buat data facility baru
      const create = await Facility.create(obj);

      // Respon sukses
      return res.status(201).json({
        status: 201,
        message: 'Success create facility',
        data: create
      });
    } catch (error) {
      logger.error(`Error : ${error}`);
      logger.error(`Error message: ${error.message}`);
      console.error('Error creating facility:', error);
      return res.status(500).json({
        status: false,
        message: 'Internal Server Error'
      });
    }
  },

  getFacility: async (req, res) => {
    try {
      let { status, search, start_date, end_date, category_id } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      let whereCondition = {}


      if (status) {
        whereCondition.status = { [Op.eq]: status };
      }

      if (category_id) {
        whereCondition.category_id = { [Op.eq]: category_id };
      }

      if (search) {
        whereCondition[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } }, // Pencarian pada kolom Facility
          { desc: { [Op.iLike]: `%${search}%` } }
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
      const [facilityGets, totalCount] = await Promise.all([
        Facility.findAll({
          where: whereCondition,
          limit: limit,
          offset: offset
        }),
        Facility.count({
          where: whereCondition
        })
      ]);

      if (!facilityGets || facilityGets.length === 0) {
        return res.status(404).json(response(404, 'Facility not found'));
      }

      // Buat pagination
      const pagination = generatePagination(totalCount, page, limit, '/api/facility/get');

      // Success response
      res.status(200).json({
        status: 200,
        message: 'success get facility',
        data: facilityGets,
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

  getFacilityById: async (req, res) => {
    try {
      const whereCondition = {
        id: req.params.id
      };
     
      const facility = await Facility.findOne({
        where: whereCondition
      });
      if (!facility) {
        return res.status(404).json(response(404, 'user facility not found'));
      }
      res.status(200).json(response(200, 'success get user facility', facility));
    } catch (err) {
      logger.error(`Error: ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  },

  updateFacility: async (req, res) => {
    try {
      const facility = await Facility.findOne({ where: { id: req.params.id } });

      if (!facility) {
        return res.status(404).json(response(404, 'facility not found'));
      }

      let company = await Company.findOne({ where: { user_id: auth.userId } });
      if (!company) {
        company = { id: 1 };
      }

      let schema = {
        title: { type: "string", optional: false },
        image: { type: "string", optional: true }
      };

      // Objek untuk membuat data facility
      const obj = {
        title: req.body.title,
      };

      // Validasi input
      const validate = v.validate(obj, schema);
      if (validate.length > 0) {
        return res.status(400).json(response(400, 'validation failed', validate));
      }

      // Jika ada file gambar yang di-upload
      if (req.file) {
        const timestamp = new Date().getTime();
        const uniqueFileName = `${timestamp}-${req.file.originalname}`;

        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: `${process.env.PATH_AWS}/facilitys/${uniqueFileName}`,
          Body: req.file.buffer,
          ACL: 'public-read',
          ContentType: req.file.mimetype
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // Menyimpan URL gambar setelah upload
        obj.image = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
      }

      // Buat data facility baru
      await Facility.update(obj, { where: { id: req.params.id } });

      const afterUpdate = await Facility.findOne({
        where: { id: req.params.id }
      });

      // Respon sukses
      return res.status(200).json({
        status: 200, message: 'Success Update facility', data: afterUpdate
      });
    } catch (error) {
      logger.error(`Error : ${error}`);
      logger.error(`Error message: ${error.message}`);
      console.error('Error creating facility:', error);
      return res.status(500).json({
        status: false,
        message: 'Internal Server Error'
      });
    }
  },

  deleteFacility: async (req, res) => {
    try {
      const whereCondition = {
        id: req.params.id
      };

      const facility = await Facility.findOne({ where: whereCondition });
      if (!facility) {
        return res.status(404).json(response(404, 'facility not found'));
      }
      
      await Facility.destroy({
        where: whereCondition
      });
      
      res.status(200).json(response(200, 'success delete facility'));
    } catch (err) {
      logger.error(`Error: ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  }
}