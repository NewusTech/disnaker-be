const { response } = require('../helpers/response.formatter');

const { Certification, Company, VacancyCategory } = require('../models');

const passwordHash = require('password-hash');
const Validator = require("fastest-validator");
const v = new Validator();
const { Op, where } = require('sequelize');
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
  createCertification: async (req, res) => {
    try {
      // Schema validasi untuk certification

      const company = await Company.findOne({ where: { user_id: auth.userId } });
      if (!company) {
        company.id = 1
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
        image: { type: "string", optional: true }
      };

      // Objek untuk membuat data certification
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
          Key: `${process.env.PATH_AWS}/certification/${uniqueFileName}`,
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

      // Buat data certification baru
      const create = await Certification.create(objCreate);

      // Respon sukses
      return res.status(201).json({
        status: 201,
        message: 'Success create certification',
        data: create
      });
    } catch (error) {
      logger.error(`Error : ${error}`);
      logger.error(`Error message: ${error.message}`);
      console.error('Error creating certification:', error);
      return res.status(500).json({
        status: false,
        message: 'Internal Server Error'
      });
    }
  },

  getCertification: async (req, res) => {
    try {
      let { status, search, start_date, end_date } = req.query;
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

      if (search) {
        whereCondition[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } }, // Pencarian pada kolom UserCertificate
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
      const [certificationGets, totalCount] = await Promise.all([
        Certification.findAll({
          include: [
            { model: Company, attributes: ['id', 'name'] },
            { model: VacancyCategory, attributes: ['id', 'name'] }
          ],
          where: whereCondition,
          limit: limit,
          offset: offset
        }),
        Certification.count({
          where: whereCondition
        })
      ]);

      if (!certificationGets || certificationGets.length === 0) {
        return res.status(404).json(response(404, 'Certifications not found'));
      }

      // Buat pagination
      const pagination = generatePagination(totalCount, page, limit, '/api/certification/get');

      // Success response
      res.status(200).json({
        status: 200,
        message: 'success get certification',
        data: certificationGets,
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


  getCertificationById: async (req, res) => {
    try {
      const whereCondition = {
        id: req.params.id
      };
      if (auth.role === 'Company') {
        whereCondition.user_id = auth.userId
      }
      const certification = await Certification.findOne({
        include: [
          { model: Company, attributes: ['id', 'name'] },
          { model: VacancyCategory, attributes: ['id', 'name'] }
        ],
        where: whereCondition
      });
      if (!certification) {
        return res.status(404).json(response(404, 'user certification not found'));
      }
      res.status(200).json(response(200, 'success get user certification', certification));
    } catch (err) {
      logger.error(`Error: ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  },

  updateCertification: async (req, res) => {
    try {
      const certification = await Certification.findOne({ where: { id: req.params.id } });

      if (!certification) {
        return res.status(404).json(response(404, 'certification not found'));
      }

      const company = await Company.findOne({ where: { user_id: auth.userId } });
      if (!company) {
        company.id = 1
      }

      // Schema validasi untuk certification
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
        image: { type: "string", optional: true }
      };

      // Jika ada file gambar yang di-upload
      if (req.file) {
        const timestamp = new Date().getTime();
        const uniqueFileName = `${timestamp}-${req.file.originalname}`;

        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: `${process.env.PATH_AWS}/certifications/${uniqueFileName}`,
          Body: req.file.buffer,
          ACL: 'public-read',
          ContentType: req.file.mimetype
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // Menyimpan URL gambar setelah upload
        req.body.image = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
      }

      // Objek untuk membuat data certification
      const certificationObj = {
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
        image: req.body.image,
        regisLink: req.body.regisLink
      };

      // Validasi input
      const validate = v.validate(certificationObj, schema);
      if (validate.length > 0) {
        return res.status(400).json(response(400, 'validation failed', validate));
      }

      certificationObj.company_id = company.id;

      // Buat data certification baru
      await Certification.update(certificationObj, { where: { id: req.params.id } });

      const afterUpdate = await Certification.findOne({
        include: [
          { model: Company, attributes: ['id', 'name'] },
        { model: VacancyCategory, attributes: ['id', 'name'] }
        ],
        where: { id: req.params.id }
      });

      // Respon sukses
      return res.status(200).json({
        status: 200, message: 'Success Update certification', data: afterUpdate
      });
    } catch (error) {
      logger.error(`Error : ${error}`);
      logger.error(`Error message: ${error.message}`);
      console.error('Error creating certification:', error);
      return res.status(500).json({
        status: false,
        message: 'Internal Server Error'
      });
    }
  },

  deleteCertification: async (req, res) => {
    try {
      const whereCondition = {
        id: req.params.id
      };
      if (auth.role === 'User') {
        whereCondition.user_id = auth.userId
      }
      await Certification.destroy({
        where: whereCondition
      });
      res.status(200).json(response(200, 'success delete certification'));
    } catch (err) {
      logger.error(`Error: ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  }
}