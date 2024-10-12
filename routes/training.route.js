const trainingController = require('../controllers/training.controller');
const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/training/create', [mid.checkRoles()], upload.single('image'), trainingController.createTraining);
route.get('/training/get', [mid.checkRoles()], trainingController.getTraining);
route.get('/training/get/:id', [mid.checkRoles()], trainingController.getTrainingById);
route.put('/training/update/:id', [mid.checkRoles()], upload.single('image'), trainingController.updateTraining);
route.delete('/training/delete/:id', [mid.checkRoles()], trainingController.deleteTraining);

module.exports = route;