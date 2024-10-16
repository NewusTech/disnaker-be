const facilityController = require('../controllers/facility.controller');
const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/facility/create', [mid.checkRoles()], upload.single('image'), facilityController.createFacility);
route.get('/facility/get', [mid.checkRoles()], facilityController.getFacility);
route.get('/facility/get/:id', [mid.checkRoles()], facilityController.getFacilityById);
route.put('/facility/update/:id', [mid.checkRoles()], upload.single('image'), facilityController.updateFacility);
route.delete('/facility/delete/:id', [mid.checkRoles()], facilityController.deleteFacility);

module.exports = route;