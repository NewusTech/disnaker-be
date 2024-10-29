const dashboardController = require('../controllers/dashboard.controller');

const mid = require('../middlewares/auth.middleware');
const express = require('express');
const route = express.Router();

route.get('/dashboard/get', dashboardController.getDashboard);
route.get('/dashboard/disnaker/get', dashboardController.getDashboardDisnaker);
route.get('/dashboard/pengaduan/get', dashboardController.getDashboardPengaduan);
route.get('/dashboard/skm/get', dashboardController.getDashboardIndeksKepuasan);
module.exports = route