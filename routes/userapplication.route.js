

const userapplicationController = require('../controllers/userapplication.controller');
const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();


route.get('/user/application/get', [mid.checkRolesAndLogout(['User'])], userapplicationController.getUserApplications);

module.exports = route;