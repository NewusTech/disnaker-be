const vacancyController = require('../controllers/vacancy.controller');

const mid = require('../middlewares/auth.middleware');
const express = require('express');
const route = express.Router();

route.post('/vacancy/create', [mid.checkRolesAndLogout(['Super Admin', 'Company'])], vacancyController.createvacancy);
route.get('/vacancy/get', [mid.checkRoles()], vacancyController.getvacancy); 
route.get('/vacancy/category/get', [mid.checkRoles()], vacancyController.getvacancycategories); 
route.get('/vacancy/get/:slug', [mid.checkRoles()], vacancyController.getvacancyBySlug); 
route.put('/vacancy/status/update/:slug', [mid.checkRolesAndLogout(['Super Admin', 'Company'])], vacancyController.updatevacancystatus); 
route.put('/vacancy/update/:slug', [mid.checkRolesAndLogout(['Super Admin', 'Company'])], vacancyController.updateVacancy); 
route.delete('/vacancy/delete/:slug', [mid.checkRolesAndLogout(['Super Admin', 'Company'])], vacancyController.deleteVacancy);

route.get('/vacancy/invitations/get', [mid.checkRoles()], vacancyController.getvacancyinvitations);
module.exports = route;