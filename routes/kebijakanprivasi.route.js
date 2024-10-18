const kebijakanprivasiController = require('../controllers/kebijakanprivasi.controller');

const mid = require('../middlewares/auth.middleware');
const express = require('express');
const route = express.Router();

route.get('/kebijakanprivasi/get', kebijakanprivasiController.getKebijakanprivasi);
route.get('/kebijakanprivasi/update', [mid.checkRolesAndLogout(['Super Admin'])], kebijakanprivasiController.updateKebijakanprivasi);
module.exports = route