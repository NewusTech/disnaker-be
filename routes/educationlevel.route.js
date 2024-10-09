const educationlevelController = require('../controllers/educationlevel.controller');

const mid = require('../middlewares/auth.middleware');
const express = require('express');
const route = express.Router();

route.get('/education-level/get', [mid.checkRoles()], educationlevelController.getEducationLevel);

module.exports = route;