const consultationController = require('../controllers/consultation.controller');
const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/consultation/create', [mid.checkRoles()], upload.single('image'), consultationController.createConsultation);
route.get('/consultation/get', [mid.checkRoles()], consultationController.getConsultation);
route.get('/consultation/get/:id', [mid.checkRoles()], consultationController.getConsultationById);
route.put('/consultation/update/:id', [mid.checkRoles()], upload.single('image'), consultationController.updateConsultation);
route.delete('/consultation/delete/:id', [mid.checkRoles()], consultationController.deleteConsultation);

module.exports = route;