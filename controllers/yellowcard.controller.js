const { response } = require('../helpers/response.formatter');
const moment = require('moment');
require('moment/locale/id');
const { YellowCard, User, UserProfile, UserEducationHistory, EducationLevel } = require('../models');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const Validator = require("fastest-validator");
const v = new Validator();
const { Op, where } = require('sequelize');
const { generatePagination } = require('../pagination/pagination');

const logger = require('../errorHandler/logger');

module.exports = {
  createYellowCard: async (req, res) => {
    try {
      // Schema validasi untuk yellowcard

      let schema = {
        residance: { type: "string", optional: false },
        provinsi: { type: "string", optional: true },
        kabupaten: { type: "string", optional: true },
        kecamatan: { type: "string", optional: true },
        kelurahan: { type: "string", optional: true },
        educationLevel_id: { type: "number", optional: true },
        job: { type: "string", optional: true },
        skill: { type: "string", optional: true },
      };

      // Objek untuk membuat data yellowcard
      const objCreate = {
        residance: req.body.residance,
        provinsi: req.body.provinsi,
        kabupaten: req.body.kabupaten,
        kecamatan: req.body.kecamatan,
        kelurahan: req.body.kelurahan,
        educationLevel_id: req.body.educationLevel_id,
        job: req.body.job,
        skill: req.body.skill
      };

      // Validasi input
      const validate = v.validate(objCreate, schema);
      if (validate.length > 0) {
        return res.status(400).json(response(400, 'validation failed', validate));
      }

      objCreate.user_id = auth.userId;

      // Buat data yellowcard baru
      const create = await YellowCard.create(objCreate);

      // Respon sukses
      return res.status(201).json({
        status: 201,
        message: 'Success create yellowcard',
        data: create
      });
    } catch (error) {
      logger.error(`Error : ${error}`);
      logger.error(`Error message: ${error.message}`);
      console.error('Error creating yellowcard:', error);
      return res.status(500).json({
        status: false,
        message: 'Internal Server Error'
      });
    }
  },

  getYellowCard: async (req, res) => {
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
          { title: { [Op.iLike]: `%${search}%` } }, // Pencarian pada kolom YellowCard
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
      const [yellowcardGets, totalCount] = await Promise.all([
        YellowCard.findAll({
          include: [
            {
              model: User,
              attributes: ['id'],
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
        YellowCard.count({
          where: whereCondition
        })
      ]);

      if (!yellowcardGets || yellowcardGets.length === 0) {
        return res.status(404).json(response(404, 'YellowCards not found'));
      }

      // Buat pagination
      const pagination = generatePagination(totalCount, page, limit, '/api/yellowcard/get');

      // Success response
      res.status(200).json({
        status: 200,
        message: 'success get yellowcard',
        data: yellowcardGets,
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

  getYellowCardById: async (req, res) => {
    try {
      const whereCondition = {
        id: req.params.id
      };

      const yellowcard = await YellowCard.findOne({
        include: [
          {
            model: User,
            attributes: ['id', 'email'],
            include: [
              { model: UserProfile, },
            ]
          },
          { model: EducationLevel, }
        ],
        where: whereCondition
      });
      if (!yellowcard) {
        return res.status(404).json(response(404, 'user yellowcard not found'));
      }
      res.status(200).json(response(200, 'success get user yellowcard', yellowcard));
    } catch (err) {
      logger.error(`Error: ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  },

  updateYellowCard: async (req, res) => {
    try {
      const yellowcard = await YellowCard.findOne({ where: { id: req.params.id } });

      if (!yellowcard) {
        return res.status(404).json(response(404, 'yellowcard not found'));
      }

      // Schema validasi untuk yellowcard
      let schema = {
        status: { type: "enum", values: ['Proses', 'Terbit', 'Ditolak'], optional: false },
      };

      // Objek untuk membuat data yellowcard
      const yellowcardObj = {
        status: req.body.status,
      };

      // Validasi input
      const validate = v.validate(yellowcardObj, schema);
      if (validate.length > 0) {
        return res.status(400).json(response(400, 'validation failed', validate));
      }

      // Buat data yellowcard baru
      await YellowCard.update(yellowcardObj, { where: { id: req.params.id } });

      const afterUpdate = await YellowCard.findOne({
        include: [
          {
            model: User,
            attributes: ['id'],
            include: [
              {
                model: UserProfile,
              }
            ]
          },
        ],
        where: { id: req.params.id }
      });

      // Respon sukses
      return res.status(200).json({
        status: 200, message: 'Success Update yellowcard', data: afterUpdate
      });
    } catch (error) {
      logger.error(`Error : ${error}`);
      logger.error(`Error message: ${error.message}`);
      console.error('Error creating yellowcard:', error);
      return res.status(500).json({
        status: 500,
        message: 'Internal Server Error'
      });
    }
  },

  generateYellowCard: async (req, res) => {
    try {
      const yellowcard = await YellowCard.findOne({
        where: [{ id: req.params.id }, { status: 'Terbit' }],
        include: [
          {
            model: User,
            include: [
              { model: UserProfile },
            ]
          },
          { model: EducationLevel },
        ],
      });
      if (!yellowcard) {
        return res.status(404).json(response(404, 'yellowcard not found'));
      }

      const templatePath = path.resolve(__dirname, '../views/kartu-kuning/kartu-kuning.html');
      let htmlContent = fs.readFileSync(templatePath, 'utf8');
      // Baca file gambar
      const logoPath = path.resolve(__dirname, '../views/kartu-kuning/logo.png');
      const logoBase64 = fs.readFileSync(logoPath, 'base64');

      // Sisipkan base64 ke dalam template HTML
      htmlContent = htmlContent.replace('{{logo}}', `data:image/png;base64,${logoBase64}`);

      htmlContent = htmlContent.replace('{{submissionNumber}}', yellowcard.submissionNumber) ?? '';
      htmlContent = htmlContent.replace('{{name}}', yellowcard.User.UserProfile.name) ?? '';
      htmlContent = htmlContent.replace('{{email}}', yellowcard.User.email) ?? '';
      htmlContent = htmlContent.replace('{{nik}}', yellowcard.User.UserProfile.nik) ?? '';
      const birthDate = moment(yellowcard.User.UserProfile.birthDate).locale('id').format('DD MMMM YYYY');
      htmlContent = htmlContent.replace('{{birthDate}}', birthDate) ?? '';
      htmlContent = htmlContent.replace('{{birthPlace}}', yellowcard.User.UserProfile.birthPlace) ?? '';
      htmlContent = htmlContent.replace('{{gender}}', yellowcard.User.UserProfile.gender) ?? '';
      htmlContent = htmlContent.replace('{{gender}}', yellowcard.User.UserProfile.gender) ?? '';
      htmlContent = htmlContent.replace('{{maritalStatus}}', yellowcard.User.UserProfile.maritalStatus) ?? '';
      htmlContent = htmlContent.replace('{{religion}}', yellowcard.User.UserProfile.religion) ?? '';
      htmlContent = htmlContent.replace('{{skills}}', yellowcard.skill) ?? '';
      htmlContent = htmlContent.replace('{{alamat}}', yellowcard.User.UserProfile.address) ?? '';
      htmlContent = htmlContent.replace('{{educationLevel}}', yellowcard.EducationLevel.level) ?? '';
      const formattedDate = moment(yellowcard.createdAt).locale('id').format('DD MMMM YYYY');
      htmlContent = htmlContent.replace('{{date}}', formattedDate) ?? '';
      htmlContent = htmlContent.replace('{{nama_pj}}', "Nama Penanggung Jawab") ?? '';
      htmlContent = htmlContent.replace('{{nip_pj}}', "1234567890123456") ?? '';
      // Launch Puppeteer
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();

      // Set HTML content
      await page.setContent(`${htmlContent}`, { waitUntil: 'networkidle0' });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape: false,
        margin: {
          top: '20px',
          right: '15px',
          bottom: '20px',
          left: '25px'
        }
      });

      await browser.close();

      // Generate filename
      const currentDate = new Date().toISOString().replace(/:/g, '-');
      const filename = `cv-${currentDate}.pdf`;

      // Set headers dan kirim file PDF
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/pdf');
      res.end(pdfBuffer, 'binary');

    } catch (error) {
      logger.error(`Error : ${error}`);
      logger.error(`Error message: ${error.message}`);
      console.error('Error creating yellowcard:', error);
      return res.status(500).json({
        status: 500,
        message: 'Internal Server Error'
      });
    }
  },
  deleteYellowCard: async (req, res) => {
    try {
      const yellowcard = await YellowCard.findOne({ where: { id: req.params.id } });
      if (!yellowcard) {
        return res.status(404).json(response(404, 'yellowcard not found'));
      }

      const whereCondition = {
        id: req.params.id
      };

      await YellowCard.destroy({
        where: whereCondition
      });

      res.status(200).json(response(200, 'success delete yellowcard'));
    } catch (err) {
      logger.error(`Error: ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  }
}