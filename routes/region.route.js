const regionController = require('../controllers/region.controller');

const mid = require('../middlewares/auth.middleware');
const express = require('express');
const route = express.Router();

route.get('/region/provinsi/get', [mid.checkRoles()], regionController.getProvince);
route.get('/region/kabupaten/get', [mid.checkRoles()], regionController.getKabupatens);
route.get('/region/kecamatan/get', [mid.checkRoles()], regionController.getKecamatans);
route.get('/region/kelurahan/get', [mid.checkRoles()], regionController.getKelurahans);

module.exports = route