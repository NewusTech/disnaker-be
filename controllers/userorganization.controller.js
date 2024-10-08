const { response } = require('../helpers/response.formatter');

const { User, UserOrganization } = require('../models');

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
  createOrganization: async (req, res) => {

    try {

      // Membuat schema untuk validasi
      const schema = {
        name: { type: "string", optional: false },
        organizationName: { type: "string", optional: false },
        desc: { type: "string", optional: true },
        joinDate: { type: "string", optional: true },
        leaveDate: { type: "string", optional: true },
        isCurrently: { type: "string", optional: true }
      }

      // Buat object userprofile
      let userEducationObj = {
        name: req.body.position,
        organizationName: req.body.organizationName,
        joinDate: req.body.joinDate,
        leaveDate: req.body.leaveDate,
        isCurrently: req.body.isCurrently,
        desc: req.body.desc
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
      let userOrgCreate = await UserOrganization.create(userEducationObj)

      res.status(200).json(response(200, 'success create userprofile', userOrgCreate));
    } catch (err) {
      logger.error(`Error: ${err}`);
      logger.error(`Error: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  },

  getOrganization: async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        let userOrganizationGets;
        let totalCount;

        const whereCondition = {
            user_id: auth.userId
        };

        [userOrganizationGets, totalCount] = await Promise.all([
            UserOrganization.findAll({
                where: whereCondition,
                limit: limit,
                offset: offset
            }),
            UserOrganization.count({
                where: whereCondition
            })
        ]);

        // Generate pagination (misal menggunakan fungsi pagination yang sama seperti di getArtikel)
        const pagination = generatePagination(totalCount, page, limit, '/api/user/organization/get');

        // Jika tidak ada data
        if (!userOrganizationGets || userOrganizationGets.length === 0) {
            res.status(404).json(response(404, 'user organization not found'));
            return;
        }

        // Jika berhasil mendapatkan data
        res.status(200).json({
            status: 200,
            message: 'success get user organization',
            data: userOrganizationGets,
            pagination: pagination
        });

    } catch (err) {
        logger.error(`Error: ${err}`);
        logger.error(`Error: ${err.message}`);
        res.status(500).json(response(500, 'internal server error', err));
        console.log(err);
    }
}

}