const usercertificateController = require('../controllers/usercertificate.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/user/certificate/create', [mid.checkRolesAndLogout(['User'])], upload.single('file'), usercertificateController.createUserCertificate);
route.get('/user/certificate/get', [mid.checkRolesAndLogout(['User'])], usercertificateController.getUserUserCertificates);
route.get('/user/certificate/get/:id', [mid.checkRolesAndLogout(['User'])], usercertificateController.getUserUserCertificatesById);
route.put('/user/certificate/update/:id', [mid.checkRolesAndLogout(['User'])], upload.single('file'), usercertificateController.updateUserCertificate);
route.delete('/user/certificate/delete/:id', [mid.checkRolesAndLogout(['User'])], usercertificateController.deleteCertificate);

module.exports = route;