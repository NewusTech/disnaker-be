
const uservacancyController = require('../controllers/uservacancy.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.post('/user/savevacancy', [mid.checkRolesAndLogout(['User'])], uservacancyController.savevacancy);
route.delete('/user/unsavevacancy', [mid.checkRolesAndLogout(['User'])], uservacancyController.unsavevacancy);
route.get('/user/savedvacancy/get', [mid.checkRolesAndLogout(['User'])], uservacancyController.getsavedVacancy);

module.exports = route;