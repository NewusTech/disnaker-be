const userController = require('../controllers/user.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.post('/register', userController.createUser);
route.post('/login', userController.loginUser);
route.post('/logout', [mid.checkRolesAndLogout(['Super Admin'])], userController.logoutUser);

// API UNTUK ADMIN / SUPER ADMIN
route.get('/users/get', [mid.checkWithPermissions(['Kelola User'])], userController.getuser);
route.post('/account/create', [mid.checkWithPermissions(['Kelola User'])], userController.adminCreateUser);
route.put('/account/update/:id', [mid.checkWithPermissions(['Kelola User'])], userController.adminUpdateUser);
// route.post('/companies/create', [mid.checkWithPermissions(['Kelola User'])], userController.adminCreateCompany);
route.get('/companies/get', [mid.checkWithPermissions(['Kelola User'])], userController.getCompany);
route.get('/companies/get/:id', [mid.checkWithPermissions(['Kelola User'])], userController.getDetailCompany);
route.get('/users/get/:slug', [mid.checkRolesAndLogout(['Kelola User'])], userController.getuserByslug);
route.delete('/user/delete/:slug', [mid.checkRolesAndLogout(['Kelola User'])], userController.deleteuser);
route.put('/account/status/update/:slug', [mid.checkWithPermissions(['Kelola User'])], userController.updateStatusAccount);

//API BUAT USER
route.get('/getforuser', [mid.checkRolesAndLogout(['Super Admin'])], userController.getforuser);

route.post('/changepassword/:slug', [mid.checkRolesAndLogout(['Super Admin'])], userController.changePassword);
route.post('/user/password/change/:slug', [mid.checkRolesAndLogout(['User'])], userController.changePassword);

route.post('/changepwadmin/:slug', [mid.checkRolesAndLogout(['Super Admin'])], userController.changePasswordFromAdmin);

route.post('/forgotpassword', userController.forgotPassword);

route.post('/resetpassword', userController.resetPassword);

route.put('/permissions', [mid.checkRolesAndLogout(['Super Admin'])], userController.updateUserpermissions);

route.get('/permissions/:userId', userController.getUserPermissions);

module.exports = route;