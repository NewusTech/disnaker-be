const certificationController = require('../controllers/certification.controller');
const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/certification/create', [mid.checkRoles()], upload.single('image'), certificationController.createCertification);
route.get('/certification/get', [mid.checkRoles()], certificationController.getCertification);
route.get('/certification/get/:id', [mid.checkRoles()], certificationController.getCertificationById);
route.put('/certification/update/:id', [mid.checkRoles()], upload.single('image'), certificationController.updateCertification);
route.delete('/certification/delete/:id', [mid.checkRoles()], certificationController.deleteCertification);

module.exports = route;