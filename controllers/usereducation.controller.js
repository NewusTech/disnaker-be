const { response } = require('../helpers/response.formatter');

const { User, UserExperience, UserProfile, UserEducationHistory, Role, sequelize, Application, Vacancy, SavedVacancy } = require('../models');

const passwordHash = require('password-hash');
const Validator = require("fastest-validator");
const v = new Validator();
const { Op, where } = require('sequelize');
const { generatePagination } = require('../pagination/pagination');

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const logger = require('../errorHandler/logger');
const vacancy = require('../models/vacancy');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  useAccelerateEndpoint: true
});

module.exports = {
  createusereducation: async (req, res) => {
    try {

      // Membuat schema untuk validasi
      const schema = {
        educationLevel_id: { type: "number", optional: false },
        instanceName: { type: "string", optional: true },
        department: { type: "string", optional: true },
        gpa: { type: "number", optional: true },
        joinDate: { type: "string", optional: true },
        graduationDate: { type: "string", optional: true },
        desc: { type: "string", optional: true },
        isCurrently: { type: "enum", values: ["true", "false"], optional: true },
        ijazah: { type: "string", optional: true },
        transkrip: { type: "string", optional: true }
      }

      if (req.files) {
        if (req.files.fileIjazah) {
          const timestamp = new Date().getTime();
          const uniqueFileName = `${timestamp}-${req.files.fileIjazah[0].originalname}`;

          const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `${process.env.PATH_AWS}/file/fileIjazah/${uniqueFileName}`,
            Body: req.files.fileIjazah[0].buffer,
            ACL: 'public-read',
            ContentType: req.files.fileIjazah[0].mimetype
          };

          const command = new PutObjectCommand(uploadParams);

          await s3Client.send(command);

          req.body.fileIjazah = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
        }
        if (req.files.fileTranskrip) {
          const timestamp = new Date().getTime();
          const uniqueFileName = `${timestamp}-${req.files.fileTranskrip[0].originalname}`;

          const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `${process.env.PATH_AWS}/file/transkrip/${uniqueFileName}`,
            Body: req.files.fileTranskrip[0].buffer,
            ACL: 'public-read',
            ContentType: req.files.fileTranskrip[0].mimetype
          };
          const command = new PutObjectCommand(uploadParams);

          await s3Client.send(command);
          req.body.fileTranskrip = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
        }
      }

      // Buat object userprofile
      let userEducationObj = {
        user_id: auth.userId,
        educationLevel_id: Number(req.body.educationLevel_id),
        instanceName: req.body.instanceName,
        department: req.body.department,
        gpa: Number(req.body.gpa),
        joinDate: req.body.joinDate,
        graduationDate: req.body.graduationDate,
        desc: req.body.desc,
        isCurrently: req.body.isCurrently,
        ijazah: req.body.fileIjazah,
        transkrip: req.body.fileTranskrip
      };

      // Validasi menggunakan module fastest-validator
      const validate = v.validate(userEducationObj, schema);
      if (validate.length > 0) {
        // Format pesan error dalam bahasa Indonesia
        const errorMessages = validate.map(error => {
          if (error.type === 'stringMin') {
            return `Field ${error.field} minimal ${error.expected} karakter`;
          } else if (error.type === 'stringMax') {
            return `Field ${error.field} maksimal ${error.expected} karakter`;
          } else if (error.type === 'stringPattern') {
            return `Field ${error.field} format tidak valid`;
          } else {
            return `Field ${error.field} tidak valid`;
          }
        });

        res.status(400).json({
          status: 400,
          message: errorMessages.join(', ')
        });
        return;
      }

      // create user education
      let userprofileCreate = await UserEducationHistory.create(userEducationObj)

      res.status(200).json(response(200, 'success create userprofile', userprofileCreate));
    } catch (err) {
      logger.error(`Error: ${err}`);
      logger.error(`Error: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  },
  getusereducation: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Kondisi where untuk pencarian dan filter
      const whereCondition = {
        user_id: auth.userId
      };

      // Menggunakan Promise.all untuk mendapatkan data dan total count secara paralel
      const [usereducationGets, totalCount] = await Promise.all([
        UserEducationHistory.findAll({
          where: whereCondition,
          limit: limit,
          offset: offset
        }),
        UserEducationHistory.count({
          where: whereCondition
        })
      ]);

      if (usereducationGets.length === 0) {
        return res.status(404).json(response(404, 'user education not found'));
      }

      // Buat pagination
      const pagination = generatePagination(totalCount, page, limit, '/api/usereducation/get');

      res.status(200).json({
        status: 200,
        message: 'success get user education',
        data: usereducationGets,
        pagination: pagination
      });
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  },

  getusereducationById: async (req, res) => {
    try {
      const whereCondition = {
        id: req.params.id
      };
      if(auth.role === 'User'){
        whereCondition.user_id = auth.userId
      }

      let usereducationGet = await UserEducationHistory.findOne({
        where: whereCondition
      });

      if (!usereducationGet) {
        return res.status(404).json(response(404, 'user education not found'));
      }

      res.status(200).json(response(200, 'success get user education', usereducationGet));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  },

  updateusereducation: async (req, res) => {
    try {
      const whereCondition = { id: req.params.id }

      let usereducationGet = await UserEducationHistory.findOne({
        where: whereCondition
      });

      if (!usereducationGet) {
        return res.status(404).json(response(404, 'user education not found'));
      }
      
      // Membuat schema untuk validasi
      const schema = {
        educationLevel_id: { type: "number", optional: false },
        instanceName: { type: "string", optional: true },
        department: { type: "string", optional: true },
        gpa: { type: "number", optional: true },
        joinDate: { type: "string", optional: true },
        graduationDate: { type: "string", optional: true },
        desc: { type: "string", optional: true },
        isCurrently: { type: "enum", values: ["true", "false"], optional: true },
        ijazah: { type: "string", optional: true },
        transkrip: { type: "string", optional: true }
      }

      if (req.files) {
        if (req.files.fileIjazah) {
          const timestamp = new Date().getTime();
          const uniqueFileName = `${timestamp}-${req.files.fileIjazah[0].originalname}`;

          const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `${process.env.PATH_AWS}/file/fileIjazah/${uniqueFileName}`,
            Body: req.files.fileIjazah[0].buffer,
            ACL: 'public-read',
            ContentType: req.files.fileIjazah[0].mimetype
          };

          const command = new PutObjectCommand(uploadParams);

          await s3Client.send(command);

          req.body.fileIjazah = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
        }
        if (req.files.fileTranskrip) {
          const timestamp = new Date().getTime();
          const uniqueFileName = `${timestamp}-${req.files.fileTranskrip[0].originalname}`;

          const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `${process.env.PATH_AWS}/file/transkrip/${uniqueFileName}`,
            Body: req.files.fileTranskrip[0].buffer,
            ACL: 'public-read',
            ContentType: req.files.fileTranskrip[0].mimetype
          };
          const command = new PutObjectCommand(uploadParams);

          await s3Client.send(command);
          req.body.fileTranskrip = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
        }
      }

      // Buat object userprofile
      let userEducationObj = {
        educationLevel_id: Number(req.body.educationLevel_id),
        instanceName: req.body.instanceName,
        department: req.body.department,
        gpa: req.body.gpa ? Number(req.body.gpa) : null,
        joinDate: req.body.joinDate,
        graduationDate: req.body.graduationDate,
        desc: req.body.desc,
        isCurrently: req.body.isCurrently,
        ijazah: req.body.fileIjazah,
        transkrip: req.body.fileTranskrip
      };

      // Validasi menggunakan module fastest-validator
      const validate = v.validate(userEducationObj, schema);
      if (validate.length > 0) {
        // Format pesan error dalam bahasa Indonesia
        const errorMessages = validate.map(error => {
          if (error.type === 'stringMin') {
            return `Field ${error.field} minimal ${error.expected} karakter`;
          } else if (error.type === 'stringMax') {
            return `Field ${error.field} maksimal ${error.expected} karakter`;
          } else if (error.type === 'stringPattern') {
            return `Field ${error.field} format tidak valid`;
          } else {
            return `Field ${error.field} tidak valid`;
          }
        });

        res.status(400).json({
          status: 400,
          message: errorMessages.join(', ')
        });
        return;
      }

      // update user education
      let userEducationCreate = await UserEducationHistory.update(userEducationObj, {
        where: whereCondition
      });

      const userEducation = await UserEducationHistory.findOne({
        where: whereCondition
      });

      res.status(200).json(response(200, 'success update userprofile', userEducation));
    } catch (err) {
      logger.error(`Error: ${err}`);
      logger.error(`Error: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  },

  deleteusereducation: async (req, res) => {
    try {
      let userprofileDelete = await UserEducationHistory.destroy({
        where: { id: req.params.id }
      });
      if (!userprofileDelete) {
        return res.status(404).json(response(404, 'user profile not found'));
      }
      res.status(200).json(response(200, 'success delete userprofile'));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  }

}