const userorganizationController = require('../controllers/userorganization.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.post('/user/organization/create', [mid.checkRolesAndLogout(['User'])], userorganizationController.createOrganization);
route.get('/user/organization/get', [mid.checkRolesAndLogout(['User'])], userorganizationController.getOrganization);
module.exports = route;