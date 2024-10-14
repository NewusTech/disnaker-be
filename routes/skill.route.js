const skillController = require('../controllers/skill.controller');

const mid = require('../middlewares/auth.middleware');
const express = require('express');
const route = express.Router();

route.get('/skill/get', [mid.checkRoles()], skillController.getSkill);
route.post('/skill/create', [mid.checkWithPermissions(['Kelola Master Data'])], skillController.createSkill);
route.get('/skill/get/:id', [mid.checkRoles()], skillController.getSkillById);
route.put('/skill/update/:id', [mid.checkWithPermissions(['Kelola Master Data'])], skillController.updateSkill);
route.put('/skill/delete/:id', [mid.checkWithPermissions(['Kelola Master Data'])], skillController.deleteSkill);

module.exports = route