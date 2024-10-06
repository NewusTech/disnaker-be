const vacancyController = require('../controllers/vacancy.controller');

const mid = require('../middlewares/auth.middleware');
const express = require('express');
const route = express.Router();

// route.post('/vacancy/create', [mid.checkRolesAndLogout(['Super Admin', 'Company'])], vacancyController.createvacancy);
route.get('/vacancy/get', [mid.checkRoles()], vacancyController.getvacancy); 
route.get('/vacancy/get/:slug', [mid.checkRoles()], vacancyController.getvacancyBySlug); 
// route.put('/vacancy/update/:slug', [mid.checkRolesAndLogout(['Super Admin', 'Company'])], vacancyController.updatevacancy); 
// route.delete('/vacancy/delete/:slug', [mid.checkRolesAndLogout(['Super Admin', 'Company'])], vacancyController.deletevacancy);

module.exports = route;