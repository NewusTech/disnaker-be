const companyController = require('../controllers/company.controller');
const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/company/create', companyController.createCompany);
// route.get('/company/get', [mid.checkRoles()], companyController.getCertification);
// route.get('/company/get/:id', [mid.checkRoles()], companyController.getCertificationById);
// route.put('/company/update/:id', [mid.checkRoles()], upload.single('image'), companyController.updateCertification);
// route.delete('/company/delete/:id', [mid.checkRoles()], companyController.deleteCertification);

module.exports = route;