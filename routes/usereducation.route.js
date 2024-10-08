const usereducationController = require('../controllers/usereducation.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.post('/user/education/create', [mid.checkRolesAndLogout(['User'])], usereducationController.createusereducation);
route.get('/user/education/get', [mid.checkRolesAndLogout(['User'])], usereducationController.getusereducation);
module.exports = route;