const { response } = require('../helpers/response.formatter');

const { Transmigration, TransmigrationMember, User, UserProfile, sequelize } = require('../models');

const Validator = require("fastest-validator");
const v = new Validator();
const { Op } = require('sequelize');
const { generatePagination } = require('../pagination/pagination');

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const logger = require('../errorHandler/logger');
const { min } = require('moment-timezone');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  useAccelerateEndpoint: true
});


module.exports = {
  createTransmigration: async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {

      // Schema validasi untuk transmigration
      let schema = {
        domicile: { type: "string", min: 3, optional: false },
        provinsi: { type: "string", min: 3, optional: false },
        kabupaten: { type: "string", min: 3, optional: false },
        kecamatan: { type: "string", min: 3, optional: false },
        kelurahan: { type: "string", min: 3, optional: false },
        kk: { type: "string", min: 3, optional: false },
        anggotaJiwa: { type: "array", min: 1, optional: true },
      };

      // Objek untuk membuat data transmigration
      const objCreate = {
        domicile: req.body.domicile,
        provinsi: req.body.provinsi,
        kabupaten: req.body.kabupaten,
        kecamatan: req.body.kecamatan,
        kelurahan: req.body.kelurahan,
        kk: req.body.kk,
        anggotaJiwa: req.body.anggotaJiwa
      };

      // Validasi input
      const validate = v.validate(objCreate, schema);
      if (validate.length > 0) {
        return res.status(400).json(response(400, 'validation failed', validate));
      }

      objCreate.user_id = auth.userId;

      // Buat data transmigration baru
      const create = await Transmigration.create(objCreate);

      req.body.anggotaJiwa.forEach(async (item) => {
        await TransmigrationMember.create({
          transmigration_id: create.id,
          nik: item.nik,
          name: item.name,
          gender: item.gender,
          familyStatus: item.familyStatus
        })
      });

      await dbTransaction.commit();
      // Response sukses
      const transmigration = await Transmigration.findOne({ where: { id: create.id }, include: [TransmigrationMember] });
      return res.status(201).json({
        status: 201,
        message: 'Success create transmigration',
        data: transmigration
      });
    } catch (error) {
      await dbTransaction.rollback();
      logger.error(`Error : ${error}`);
      logger.error(`Error message: ${error.message}`);
      console.error('Error creating transmigration:', error);
      return res.status(500).json({
        status: 500,
        message: 'Internal Server Error'
      });
    }
  },

  getTransmigration: async (req, res) => {
    try {
      let { status, search, start_date, end_date, category_id } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      let whereCondition = {}

      if (auth.role === 'User') whereCondition.user_id = { [Op.eq]: auth.userId };

      if (status) {
        whereCondition.status = { [Op.eq]: status };
      }

      if (category_id) {
        whereCondition.category_id = { [Op.eq]: category_id };
      }

      if (search) {
        whereCondition[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } }, // Pencarian pada kolom Transmigration
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
      const [transmigrationGets, totalCount] = await Promise.all([
        Transmigration.findAll({
          include: [
            {
              model: User,
              attributes: ['id', 'email'],
              include: [
                {
                  model: UserProfile,
                }
              ]
            },
          ],
          where: whereCondition,
          limit: limit,
          offset: offset
        }),
        Transmigration.count({
          where: whereCondition
        })
      ]);

      if (!transmigrationGets || transmigrationGets.length === 0) {
        return res.status(404).json(response(404, 'Transmigrations not found'));
      }

      // Buat pagination
      const pagination = generatePagination(totalCount, page, limit, '/api/transmigration/get');

      // Success response
      res.status(200).json({
        status: 200,
        message: 'success get transmigration',
        data: transmigrationGets,
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

  getTransmigrationById: async (req, res) => {
    try {
      const whereCondition = {
        id: req.params.id
      };

      const transmigration = await Transmigration.findOne({
        include: [
          {
            model: User,
            attributes: ['id'],
            include: [
              { model: UserProfile, },
            ]
          },
          { model: TransmigrationMember, },
        ],
        where: whereCondition
      });
      if (!transmigration) {
        return res.status(404).json(response(404, 'user transmigration not found'));
      }
      res.status(200).json(response(200, 'success get user transmigration', transmigration));
    } catch (err) {
      logger.error(`Error: ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  },

  updateTransmigration: async (req, res) => {
    try {
      const transmigration = await Transmigration.findOne({ where: { id: req.params.id } });

      if (!transmigration) {
        return res.status(404).json(response(404, 'transmigration not found'));
      }

      // Schema validasi untuk transmigration
      let schema = {
        status: { type: "enum", values: ['Proses', 'Terbit', 'Diterima', 'Ditolak'], optional: false },
      };

      // Objek untuk membuat data transmigration
      const transmigrationObj = {
        status: req.body.status,
      };

      // Validasi input
      const validate = v.validate(transmigrationObj, schema);
      if (validate.length > 0) {
        return res.status(400).json(response(400, 'validation failed', validate));
      }

      // Buat data transmigration baru
      await Transmigration.update(transmigrationObj, { where: { id: req.params.id } });

      const afterUpdate = await Transmigration.findOne({
        include: [
          {
            model: User,
            attributes: ['id'],
            include: [
              {
                model: UserProfile
              }
            ]
          },
        ],
        where: { id: req.params.id }
      });

      // Respon sukses
      return res.status(200).json({
        status: 200, message: 'Success Update transmigration', data: afterUpdate
      });
    } catch (error) {
      logger.error(`Error : ${error}`);
      logger.error(`Error message: ${error.message}`);
      console.error('Error creating transmigration:', error);
      return res.status(500).json({
        status: 500,
        message: 'Internal Server Error'
      });
    }
  },

  deleteTransmigration: async (req, res) => {
    try {
      const transmigration = await Transmigration.findOne({ where: { id: req.params.id } });
      if (!transmigration) {
        return res.status(404).json(response(404, 'transmigration not found'));
      }

      const whereCondition = {
        id: req.params.id
      };

      await Transmigration.destroy({
        where: whereCondition
      });

      res.status(200).json(response(200, 'success delete transmigration'));
    } catch (err) {
      logger.error(`Error: ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  }
}