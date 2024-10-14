const jobinviteController = require('../controllers/jobinvite.controller');
const jobInviteController = require('../controllers/jobinvite.controller');

const mid = require('../middlewares/auth.middleware');
const express = require('express');
const route = express.Router();

route.post('/job/invitation/create', [mid.checkWithPermissions(['Kelola Pelamar'])], jobInviteController.invite);
route.get('/job/invitation/get', [mid.checkWithPermissions(['Kelola Pelamar'])], jobInviteController.getInvitation); 
route.get('/user/invitation/get', [mid.checkRolesAndLogout(['User'])], jobinviteController.getUserInvitation);
route.put('/user/invitation/update/:id', [mid.checkRolesAndLogout(['User'])], jobinviteController.updateInvitation); 
// route.put('/application/update/:slug', [mid.checkRolesAndLogout(['Super Admin', 'Company'])], ); 
// route.delete('/application/delete/:slug', [mid.checkRolesAndLogout(['Super Admin', 'Company'])], applicationController.deleteapplication);

module.exports = route;