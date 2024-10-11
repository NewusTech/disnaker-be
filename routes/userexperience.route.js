const userexperienceController = require('../controllers/userexperience.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.post('/user/experience/create', [mid.checkRolesAndLogout(['User'])], userexperienceController.createUserExperience);
route.get('/user/experience/get', [mid.checkRolesAndLogout(['User'])], userexperienceController.getUserExperience);
route.get('/user/experience/get/:id', [mid.checkRolesAndLogout(['User'])], userexperienceController.getUserExperienceById);
route.put('/user/experience/update/:id', [mid.checkRolesAndLogout(['User'])], userexperienceController.updateUserExperience);
route.delete('/user/experience/delete/:id', [mid.checkRolesAndLogout(['User'])], userexperienceController.deleteUserExperience);
module.exports = route;