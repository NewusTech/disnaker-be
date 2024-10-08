const userexperienceController = require('../controllers/userexperience.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.post('/user/experience/create', [mid.checkRolesAndLogout(['User'])], userexperienceController.createUserExperience);
route.get('/user/experience/get', [mid.checkRolesAndLogout(['User'])], userexperienceController.getUserExperience);

module.exports = route;