const userSkillController = require('../controllers/userskill.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.post('/user/skill/create', [mid.checkRolesAndLogout(['User'])], userSkillController.createUserSkill);
route.get('/user/skill/get', [mid.checkRolesAndLogout(['User'])], userSkillController.getUserSkill);

module.exports = route;