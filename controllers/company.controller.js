const { response } = require('../helpers/response.formatter');

const { Role, Company, User } = require('../models');

const passwordHash = require('password-hash');
const Validator = require("fastest-validator");
const v = new Validator();
const { Op, where } = require('sequelize');
const { generatePagination } = require('../pagination/pagination');

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const logger = require('../errorHandler/logger');
const company = require('../models/company');
const { default: slugify } = require('slugify');
const { name } = require('ejs');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  useAccelerateEndpoint: true
});


module.exports = {
  createCompany: async (req, res) => {
    try {
      const companyExist = await User.findOne({ where: { email: req.body.email } });
      if (companyExist) return res.status(400).json(response(400, 'Company already exist'));

      const role = await Role.findOne({ where: { name: 'Company' } });
      if (!role) return res.status(404).json(response(404, 'role not found'));

      const schema = {
        name: { type: "string", min: 3 },
        email: { type: "string", min: 5, max: 50, pattern: /^\S+@\S+\.\S+$/, optional: true },
        password: { type: "string", min: 5, max: 16 },
        role_id: { type: "number", optional: true }
      };

      const obj = {
        name: req.body.name,
        password: req.body.password,
        role_id: role.id,
        email: req.body.email,
      };

      const validate = v.validate(obj, schema);

      if (validate.length > 0) {
        const errorMessages = validate.map(error => {
          if (error.type === 'stringMin') {
            return `${error.field} minimal ${error.expected} karakter`;
          } else if (error.type === 'stringMax') {
            return `${error.field} maksimal ${error.expected} karakter`;
          } else if (error.type === 'stringPattern') {
            return `${error.field} format tidak valid`;
          } else {
            return `${error.field} tidak valid`;
          }
        });
        res.status(400).json({
          status: 400,
          message: errorMessages.join(', ')
        });
        return;
      }
      obj.password = passwordHash.generate(obj.password);

      let company = await User.create(obj);
      if (company) {
        company.profile = await Company.create({ user_id: company.id, name: obj.name, slug: company.slug });
      }

      const companyResponse = {
        id: company.id,
        name: company.profile.name,
        email: company.email,
        role_id: company.role_id,
        slug: company.slug,
        isActive: company.isActive,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      }

      res.status(201).json(response(201, 'company created', companyResponse));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  },
}

