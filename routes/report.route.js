const reportController = require('../controllers/report.controller');

const mid = require('../middlewares/auth.middleware');
const express = require('express');
const route = express.Router();

route.get('/report/get', [mid.checkWithPermissions(['Kelola Laporan'])], reportController.getReport);
module.exports = route