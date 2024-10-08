const { response } = require('../helpers/response.formatter');

const { User, UserLink } = require('../models');

const Validator = require("fastest-validator");
const v = new Validator();
const logger = require('../errorHandler/logger');

module.exports = {
  createUserLink: async (req, res) => {
    try {

      // Membuat schema untuk validasi
      const schema = {
        user_id: { type: "number", optional: false },
        link: { type: "string", optional: false, min: 3 },
        linkType: { type: "enum", values: ['portfolio', 'instagram', 'facebook', 'twitter', 'linkedin'], optional: false, min: 3 }
      }

      // Buat object user link
      let userLinkObj = {
        user_id: auth.userId,
        link: req.body.link,
        linkType: req.body.linkType
      };

      // Validasi menggunakan module fastest-validator
      const validate = v.validate(userLinkObj, schema);
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

      // create user experience
      let userLinkCreate = await UserLink.create(userLinkObj);

      res.status(200).json(response(200, 'success create user link', userLinkCreate));
    } catch (err) {
      logger.error(`Error: ${err}`);
      logger.error(`Error: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  },
  getUserLink: async (req, res) => {
    try {

      // Kondisi where untuk pencarian dan filter
      const whereCondition = {
        id: auth.userId
      };

      // Menggunakan Promise.all untuk mendapatkan data dan total count secara paralel
      const user = await User.findOne({
        where: whereCondition,
        include: [
          {  model: UserLink }
        ]
      })

      if (!user) {
        return res.status(404).json(response(404, 'user experience not found'));
      }

      const userLink = user.UserLinks

      res.status(200).json({
        status: 200,
        message: 'success get user experience',
        data: userLink,
      });
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
    }
  }

}