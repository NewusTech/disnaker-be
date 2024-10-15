const applicationController = require('../controllers/application.controller');

const mid = require('../middlewares/auth.middleware');
const express = require('express');
const route = express.Router();

route.post('/application/create', [mid.checkRolesAndLogout(['User'])], applicationController.createapplication);
route.get('/application/get', [mid.checkRolesAndLogout(['Super Admin', 'Company'])], applicationController.getApplication); 
route.put('/application/update/:id', [mid.checkRolesAndLogout(['Super Admin', 'Company'])], applicationController.updateApplication); 
// route.get('/application/get/:slug', [mid.checkRoles()], applicationController.getapplicationBySlug); 
// route.put('/application/update/:slug', [mid.checkRolesAndLogout(['Super Admin', 'Company'])], applicationController.updateapplication); 
// route.delete('/application/delete/:slug', [mid.checkRolesAndLogout(['Super Admin', 'Company'])], applicationController.deleteapplication);

module.exports = route;