const { response } = require('../helpers/response.formatter');

const { Consultation, Company, VacancyCategory } = require('../models');

const Validator = require("fastest-validator");
const v = new Validator();
const { Op } = require('sequelize');
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
  createConsultation: async (req, res) => {
    try {
      // Schema validasi untuk consultation

      let company = await Company.findOne({ where: { user_id: auth.userId } });
      if (!company) {
        // Jika company tidak ditemukan, buat object dengan id = 1
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
        regisLink: { type: "string", optional: true },
        image: { type: "string", optional: true }
      };

      // Objek untuk membuat data consultation
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
          Key: `${process.env.PATH_AWS}/consultations/${uniqueFileName}`,
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

      // Buat data consultation baru
      const create = await Consultation.create(objCreate);

      // Respon sukses
      return res.status(201).json({
        status: 201,
        message: 'Success create consultation',
        data: create
      });
    } catch (error) {
      logger.error(`Error : ${error}`);
      logger.error(`Error message: ${error.message}`);
      console.error('Error creating consultation:', error);
      return res.status(500).json({
        status: false,
        message: 'Internal Server Error'
      });
    }
  },

  getConsultation: async (req, res) => {
    try {
      let { status, search, start_date, end_date } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      let whereCondition = {}

      // Kondisi where untuk pencarian, filter status, dan filter tanggal
      if (auth.role === "Company") {
        const company = Company.findOne({ where: { user_id: auth.userId } });
        whereCondition = { company_id: company.id };
      }

      if (status) {
        whereCondition.status = { [Op.eq]: status };
      }

      if (search) {
        whereCondition[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } }, // Pencarian pada kolom Consultation
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
      const [consultationGets, totalCount] = await Promise.all([
        Consultation.findAll({
          include: [
            { model: Company, attributes: ['id', 'name'] },
            { model: VacancyCategory, attributes: ['id', 'name'] }
          ],
          where: whereCondition,
          limit: limit,
          offset: offset
        }),
        Consultation.count({
          where: whereCondition
        })
      ]);

      if (!consultationGets || consultationGets.length === 0) {
        return res.status(404).json(response(404, 'Consultations not found'));
      }

      // Buat pagination
      const pagination = generatePagination(totalCount, page, limit, '/api/consultation/get');

      // Success response
      res.status(200).json({
        status: 200,
        message: 'success get consultation',
        data: consultationGets,
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

  getConsultationById: async (req, res) => {
    try {
      const whereCondition = {
        id: req.params.id
      };
      if (auth.role === 'Company') {
        whereCondition.user_id = auth.userId
      }
      const consultation = await Consultation.findOne({
        include: [
          { model: Company, attributes: ['id', 'name'] },
          { model: VacancyCategory, attributes: ['id', 'name'] }
        ],
        where: whereCondition
      });
      if (!consultation) {
        return res.status(404).json(response(404, 'user consultation not found'));
      }
      res.status(200).json(response(200, 'success get user consultation', consultation));
    } catch (err) {
      logger.error(`Error: ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  },

  updateConsultation: async (req, res) => {
    try {
      const consultation = await Consultation.findOne({ where: { id: req.params.id } });

      if (!consultation) {
        return res.status(404).json(response(404, 'consultation not found'));
      }

      let company = await Company.findOne({ where: { user_id: auth.userId } });
      if (!company) {
        company = { id: 1 };
      }

      // Schema validasi untuk consultation
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

      // Objek untuk membuat data consultation
      const consultationObj = {
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
      const validate = v.validate(consultationObj, schema);
      if (validate.length > 0) {
        return res.status(400).json(response(400, 'validation failed', validate));
      }

      // Jika ada file gambar yang di-upload
      if (req.file) {
        const timestamp = new Date().getTime();
        const uniqueFileName = `${timestamp}-${req.file.originalname}`;

        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: `${process.env.PATH_AWS}/consultations/${uniqueFileName}`,
          Body: req.file.buffer,
          ACL: 'public-read',
          ContentType: req.file.mimetype
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // Menyimpan URL gambar setelah upload
        consultationObj.image = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
      }
      consultationObj.company_id = company.id;

      // Buat data consultation baru
      await Consultation.update(consultationObj, { where: { id: req.params.id } });

      const afterUpdate = await Consultation.findOne({
        include: [
          { model: Company, attributes: ['id', 'name'] },
          { model: VacancyCategory, attributes: ['id', 'name'] }
        ],
        where: { id: req.params.id }
      });

      // Respon sukses
      return res.status(200).json({
        status: 200, message: 'Success Update consultation', data: afterUpdate
      });
    } catch (error) {
      logger.error(`Error : ${error}`);
      logger.error(`Error message: ${error.message}`);
      console.error('Error creating consultation:', error);
      return res.status(500).json({
        status: false,
        message: 'Internal Server Error'
      });
    }
  },

  deleteConsultation: async (req, res) => {
    try {
      const consultation = await Consultation.findOne({ where: { id: req.params.id } });
      if (!consultation) {
        return res.status(404).json(response(404, 'consultation not found'));
      }
      const whereCondition = {
        id: req.params.id
      };
      
      await Consultation.destroy({
        where: whereCondition
      });
      res.status(200).json(response(200, 'success delete consultation'));
    } catch (err) {
      logger.error(`Error: ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  }
}