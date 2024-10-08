const userlinkController = require('../controllers/userlink.controller');
const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.post('/user/link/create', [mid.checkRolesAndLogout(['User'])], userlinkController.createUserLink);
route.get('/user/link/get', [mid.checkRolesAndLogout(['User'])], userlinkController.getUserLink);
module.exports = route;