const { response } = require('../helpers/response.formatter');

const { SyaratKetentuan } = require('../models');
const Validator = require("fastest-validator");
const v = new Validator();
const { Op, where } = require('sequelize');
const { generatePagination } = require('../pagination/pagination');
const logger = require('../errorHandler/logger');


module.exports = {
  getSnk: async (req, res) => {
    try {
      const snk = await SyaratKetentuan.findOne({ where: { id: 1 } });

      if (!snk) {
        return res.status(404).json(response(404, 'snk not found'));
      }

      res.status(200).json(response(200, 'success get snk', snk));
    } catch (err) {
      logger.error(`Error : ${err}`);
      logger.error(`Error message: ${err.message}`);
      res.status(500).json(response(500, 'internal server error', err));
      console.log(err);
    }
  },
}