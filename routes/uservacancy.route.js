
const uservacancyController = require('../controllers/uservacancy.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.post('/user/savevacancy', [mid.checkRolesAndLogout(['User'])], uservacancyController.savevacancy);
route.get('/user/vacancy/recomendation', [mid.checkRolesAndLogout(['User'])], uservacancyController.getRecommendation)
route.get('/user/vacancy/urgent', [mid.checkRolesAndLogout(['User'])], uservacancyController.getVacancyUrgent)
route.delete('/user/unsavevacancy', [mid.checkRolesAndLogout(['User'])], uservacancyController.unsavevacancy);
route.get('/user/savedvacancy/get', [mid.checkRolesAndLogout(['User'])], uservacancyController.getsavedVacancy);

module.exports = route;