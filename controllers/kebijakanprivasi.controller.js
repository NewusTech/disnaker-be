const { response } = require('../helpers/response.formatter');

const { KebijakanPrivasi } = require('../models');
const Validator = require("fastest-validator");
const v = new Validator();
const { Op, where } = require('sequelize');
const logger = require('../errorHandler/logger');
const { updateImageProfile } = require('./userprofile.controller');


module.exports = {
  getKebijakanprivasi: async (req, res) => {
    try {
      const kebijakanprivasi = await KebijakanPrivasi.findOne({ where: { id: 1 } });

      if (!kebijakanprivasi) {
        return res.status(404).json(response(404, 'kebijakan privasi not found'));
      }

      res.status(200).json(response(200, 'success get kebijaka privasi', kebijakanprivasi));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  },
  updateKebijakanprivasi: async (req, res) => {
    try {
      const schema = {
        syarat: "string|required",
      };
      
      const obj = {
        syarat: req.body.syarat,
      };
      
      const validate = v.validate(obj, schema);
      
      if (validate.length > 0) {
        return res.status(400).json(response(400, 'validation failed', validate));
      }
      await KebijakanPrivasi.update(obj,{ where: { id: 1 } });
      
      const kebijakanprivasiAfterUpdate = await KebijakanPrivasi.findOne({ where: { id: 1 } });
      
      res.status(200).json(response(200, 'success update kebijakan privasi', kebijakanprivasiAfterUpdate));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  }
}