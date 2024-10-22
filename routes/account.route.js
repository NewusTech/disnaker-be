const accountController = require('../controllers/account.controller');

const mid = require('../middlewares/auth.middleware');
const express = require('express');
const route = express.Router();

route.get('/account/get', [mid.checkWithPermissions(['Kelola Akun'])], accountController.getAccount);
route.get('/account/get/:id', [mid.checkWithPermissions(['Kelola Akun'])], accountController.getAccountById);
route.delete('/account/delete/:id', [mid.checkWithPermissions(['Kelola Akun'])], accountController.deleteAccount);
module.exports = route