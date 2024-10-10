const skillController = require('../controllers/skill.controller');

const mid = require('../middlewares/auth.middleware');
const express = require('express');
const route = express.Router();

route.get('/skill/get', [mid.checkRoles()], skillController.getSkill);

module.exports = route