const { response } = require('../helpers/response.formatter');

const { Training, Company, VacancyCategory } = require('../models');

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
  createTraining: async (req, res) => {
    try {
      // Schema validasi untuk training

      let company = await Company.findOne({ where: { user_id: auth.userId } });
      if (!company) {
        company = { id: 1 };
      }

      let schema = {
        category_id: { type: "number", optional: false },
        title: { type: "string", optional: false },
        desc: { type: "string", optional: true },
        location: { type: "string", optional: true },
        quota: { type: "number", optional: true },
        startDate: { type: "string", optional: false },
        endDate: { type: "string", optional: true },
        time: { type: "string", optional: true },
        phoneNumber: { type: "string", optional: true },
        level: { type: "enum", values: ["Rendah", "Menengah", "Tinggi"], optional: true }, // validasi ENUM
        regisLink: { type: "string", optional: true },
        linkModule: { type: "string", optional: true },
        image: { type: "string", optional: true }
      };

      // Objek untuk membuat data training
      const objCreate = {
        category_id: Number(req.body.category_id),
        title: req.body.title,
        desc: req.body.desc,
        location: req.body.location,
        quota: Number(req.body.quota),
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        time: req.body.time,
        phoneNumber: req.body.phoneNumber,
        level: req.body.level,
        linkModule: req.body.linkModule,
        regisLink: req.body.regisLink,
      };

      // Validasi input
      const validate = v.validate(objCreate, schema);
      if (validate.length > 0) {
        return res.status(400).json(response(400, 'validation failed', validate));
      }

      // Jika ada file gambar yang di-upload
      if (req.file) {
        const timestamp = new Date().getTime();
        const uniqueFileName = `${timestamp}-${req.file.originalname}`;

        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: `${process.env.PATH_AWS}/trainings/${uniqueFileName}`,
          Body: req.file.buffer,
          ACL: 'public-read',
          ContentType: req.file.mimetype
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // Menyimpan URL gambar setelah upload
        objCreate.image = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
      }
      objCreate.company_id = company.id;

      // Buat data training baru
      const create = await Training.create(objCreate);

      // Respon sukses
      return res.status(201).json({
        status: 201,
        message: 'Success create training',
        data: create
      });
    } catch (error) {
      logger.error(`Error : ${error}`);
      logger.error(`Error message: ${error.message}`);
      console.error('Error creating training:', error);
      return res.status(500).json({
        status: false,
        message: 'Internal Server Error'
      });
    }
  },

  getTraining: async (req, res) => {
    try {
      let { status, search, start_date, end_date, category_id } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      let whereCondition = {}

      // Kondisi where untuk pencarian, filter status, dan filter tanggal
      if (auth.role === "company") {
        const company = Company.findOne({ where: { user_id: auth.userId } });
        whereCondition = { company_id: company.id };
      }

      if (status) {
        whereCondition.status = { [Op.eq]: status };
      }

      if (category_id) {
        whereCondition.category_id = { [Op.eq]: category_id };
      }

      if (search) {
        whereCondition[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } }, // Pencarian pada kolom Training
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
      const [trainingGets, totalCount] = await Promise.all([
        Training.findAll({
          include: [
            { model: Company, attributes: ['id', 'name'] },
            { model: VacancyCategory, attributes: ['id', 'name'] }
          ],
          where: whereCondition,
          limit: limit,
          offset: offset
        }),
        Training.count({
          where: whereCondition
        })
      ]);

      if (!trainingGets || trainingGets.length === 0) {
        return res.status(404).json(response(404, 'Trainings not found'));
      }

      // Buat pagination
      const pagination = generatePagination(totalCount, page, limit, '/api/training/get');

      // Success response
      res.status(200).json({
        status: 200,
        message: 'success get training',
        data: trainingGets,
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

  getTrainingById: async (req, res) => {
    try {
      const whereCondition = {
        id: req.params.id
      };
      if (auth.role === 'Company') {
        whereCondition.user_id = auth.userId
      }
      const training = await Training.findOne({
        include: [
          { model: Company, attributes: ['id', 'name'] },
          { model: VacancyCategory, attributes: ['id', 'name'] }
        ],
        where: whereCondition
      });
      if (!training) {
        return res.status(404).json(response(404, 'user training not found'));
      }
      res.status(200).json(response(200, 'success get user training', training));
    } catch (err) {
      logger.error(`Error: ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  },

  updateTraining: async (req, res) => {
    try {
      const training = await Training.findOne({ where: { id: req.params.id } });

      if (!training) {
        return res.status(404).json(response(404, 'training not found'));
      }

      let company = await Company.findOne({ where: { user_id: auth.userId } });
      if (!company) {
        company = { id: 1 };
      }

      // Schema validasi untuk training
      let schema = {
        category_id: { type: "number", optional: false },
        title: { type: "string", optional: false },
        desc: { type: "string", optional: true },
        location: { type: "string", optional: true },
        quota: { type: "number", optional: true },
        startDate: { type: "string", optional: false },
        endDate: { type: "string", optional: true },
        time: { type: "string", optional: true },
        phoneNumber: { type: "string", optional: true },
        level: { type: "enum", values: ["Rendah", "Menengah", "Tinggi"], optional: true }, // validasi ENUM
        regisLink: { type: "string", optional: true },
        linkModule: { type: "string", optional: true },
        image: { type: "string", optional: true }
      };

      // Objek untuk membuat data training
      const trainingObj = {
        category_id: Number(req.body.category_id),
        title: req.body.title,
        desc: req.body.desc,
        location: req.body.location,
        quota: Number(req.body.quota),
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        time: req.body.time,
        phoneNumber: req.body.phoneNumber,
        level: req.body.level,
        linkModule: req.body.linkModule,
        regisLink: req.body.regisLink,
      };

      // Validasi input
      const validate = v.validate(trainingObj, schema);
      if (validate.length > 0) {
        return res.status(400).json(response(400, 'validation failed', validate));
      }

      // Jika ada file gambar yang di-upload
      if (req.file) {
        const timestamp = new Date().getTime();
        const uniqueFileName = `${timestamp}-${req.file.originalname}`;

        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: `${process.env.PATH_AWS}/trainings/${uniqueFileName}`,
          Body: req.file.buffer,
          ACL: 'public-read',
          ContentType: req.file.mimetype
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // Menyimpan URL gambar setelah upload
        trainingObj.image = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
      }
      trainingObj.company_id = company.id;

      // Buat data training baru
      await Training.update(trainingObj, { where: { id: req.params.id } });

      const afterUpdate = await Training.findOne({
        include: [
          { model: Company, attributes: ['id', 'name'] },
          { model: VacancyCategory, attributes: ['id', 'name'] }
        ],
        where: { id: req.params.id }
      });

      // Respon sukses
      return res.status(200).json({
        status: 200, message: 'Success Update training', data: afterUpdate
      });
    } catch (error) {
      logger.error(`Error : ${error}`);
      logger.error(`Error message: ${error.message}`);
      console.error('Error creating training:', error);
      return res.status(500).json({
        status: false,
        message: 'Internal Server Error'
      });
    }
  },

  deleteTraining: async (req, res) => {
    try {
      const training = await Training.findOne({ where: { id: req.params.id } });
      if (!training) {
        return res.status(404).json(response(404, 'training not found'));
      }

      const whereCondition = {
        id: req.params.id
      };
      
      await Training.destroy({
        where: whereCondition
      });
      
      res.status(200).json(response(200, 'success delete training'));
    } catch (err) {
      logger.error(`Error: ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  }
}