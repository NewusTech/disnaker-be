const { response } = require('../helpers/response.formatter');

const { Complaint, User, UserProfile } = require('../models');

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
  createComplaint: async (req, res) => {
    try {
      // Schema validasi untuk complaint

      let schema = {
        title: { type: "string", optional: false },
        desc: { type: "string", optional: true },
      };

      // Objek untuk membuat data complaint
      const objCreate = {
        title: req.body.title,
        desc: req.body.desc,
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
          Key: `${process.env.PATH_AWS}/complaints/${uniqueFileName}`,
          Body: req.file.buffer,
          ACL: 'public-read',
          ContentType: req.file.mimetype
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // Menyimpan URL gambar setelah upload
        objCreate.file = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
      }
      objCreate.user_id = auth.userId;

      // Buat data complaint baru
      const create = await Complaint.create(objCreate);

      // Respon sukses
      return res.status(201).json({
        status: 201,
        message: 'Success create complaint',
        data: create
      });
    } catch (error) {
      logger.error(`Error : ${error}`);
      logger.error(`Error message: ${error.message}`);
      console.error('Error creating complaint:', error);
      return res.status(500).json({
        status: false,
        message: 'Internal Server Error'
      });
    }
  },

  getComplaint: async (req, res) => {
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
          { title: { [Op.iLike]: `%${search}%` } }, // Pencarian pada kolom Complaint
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
      const [complaintGets, totalCount] = await Promise.all([
        Complaint.findAll({
          include: [
            {
              model: User,
              attributes: ['id'],
              include: [
                {
                  model: UserProfile,
                  attributes: ['id', 'name']
                }
              ]
            },
          ],
          where: whereCondition,
          limit: limit,
          offset: offset
        }),
        Complaint.count({
          where: whereCondition
        })
      ]);

      if (!complaintGets || complaintGets.length === 0) {
        return res.status(404).json(response(404, 'Complaints not found'));
      }

      // Buat pagination
      const pagination = generatePagination(totalCount, page, limit, '/api/complaint/get');

      // Success response
      res.status(200).json({
        status: 200,
        message: 'success get complaint',
        data: complaintGets,
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

  getComplaintById: async (req, res) => {
    try {
      const whereCondition = {
        id: req.params.id
      };

      const complaint = await Complaint.findOne({
        include: [
          {
            model: User,
            attributes: ['id'],
            include: [
              {
                model: UserProfile,
                attributes: ['id', 'name']
              }
            ]
          },
        ],
        where: whereCondition
      });
      if (!complaint) {
        return res.status(404).json(response(404, 'user complaint not found'));
      }
      res.status(200).json(response(200, 'success get user complaint', complaint));
    } catch (err) {
      logger.error(`Error: ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  },

  updateComplaint: async (req, res) => {
    try {
      const complaint = await Complaint.findOne({ where: { id: req.params.id } });

      if (!complaint) {
        return res.status(404).json(response(404, 'complaint not found'));
      }

      // Schema validasi untuk complaint
      let schema = {
        status: { type: "enum", values: [ "Ditutup", "Diterima"], optional: false },
        response: { type: "string", optional: true },
      };

      // Objek untuk membuat data complaint
      const complaintObj = {
        status: req.body.status,
        response: req.body.response
      };

      // Validasi input
      const validate = v.validate(complaintObj, schema);
      if (validate.length > 0) {
        return res.status(400).json(response(400, 'validation failed', validate));
      }

      // Buat data complaint baru
      await Complaint.update(complaintObj, { where: { id: req.params.id } });

      const afterUpdate = await Complaint.findOne({
        include: [
          {
            model: User,
            attributes: ['id'],
            include: [
              {
                model: UserProfile,
                attributes: ['id', 'name']
              }
            ]
          },
        ],
        where: { id: req.params.id }
      });

      // Respon sukses
      return res.status(200).json({
        status: 200, message: 'Success Update complaint', data: afterUpdate
      });
    } catch (error) {
      logger.error(`Error : ${error}`);
      logger.error(`Error message: ${error.message}`);
      console.error('Error creating complaint:', error);
      return res.status(500).json({
        status: 500,
        message: 'Internal Server Error'
      });
    }
  },

  deleteComplaint: async (req, res) => {
    try {
      const complaint = await Complaint.findOne({ where: { id: req.params.id } });
      if (!complaint) {
        return res.status(404).json(response(404, 'complaint not found'));
      }

      const whereCondition = {
        id: req.params.id
      };

      await Complaint.destroy({
        where: whereCondition
      });

      res.status(200).json(response(200, 'success delete complaint'));
    } catch (err) {
      logger.error(`Error: ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  }
}