const accountController = require('../controllers/account.controller');

const mid = require('../middlewares/auth.middleware');
const express = require('express');
const route = express.Router();

route.get('/account/get', [mid.checkWithPermissions(['Kelola Akun'])], accountController.getAccount);
module.exports = route