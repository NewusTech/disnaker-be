const informationController = require('../controllers/information.controller');

const mid = require('../middlewares/auth.middleware');
const express = require('express');
const route = express.Router();

route.get('/information/get', [mid.checkRoles()], informationController.getInformation);
route.get('/information/get/:id', [mid.checkRoles()], informationController.getById);
route.post('/information/create', [mid.checkWithPermissions(['Kelola Informasi'])], informationController.createInformation);
route.put('/information/update/:id', [mid.checkWithPermissions(['Kelola Informasi'])], informationController.updateInformation);
route.delete('/information/delete/:id', [mid.checkWithPermissions(['Kelola Informasi'])], informationController.delete);
module.exports = route