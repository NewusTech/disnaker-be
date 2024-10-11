const userlinkController = require('../controllers/userlink.controller');
const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.post('/user/link/create', [mid.checkRolesAndLogout(['User'])], userlinkController.createUserLink);
route.get('/user/link/get', [mid.checkRolesAndLogout(['User'])], userlinkController.getUserLink);
route.get('/user/link/get/:id', [mid.checkRolesAndLogout(['User'])], userlinkController.getUserLinkById);
route.put('/user/link/update/:id', [mid.checkRolesAndLogout(['User'])], userlinkController.updateUserLink);
route.delete('/user/link/delete/:id', [mid.checkRolesAndLogout(['User'])], userlinkController.deleteUserLink);
module.exports = route;