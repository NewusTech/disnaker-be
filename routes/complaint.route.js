const complaintController = require('../controllers/complaint.controller');
const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/complaint/create', [mid.checkRolesAndLogout(['User'])], upload.single('file'), complaintController.createComplaint);
route.get('/complaint/get', [mid.checkRoles()], complaintController.getComplaint);
route.get('/complaint/get/:id', [mid.checkRoles()], complaintController.getComplaintById);
route.put('/complaint/update/:id', [mid.checkRolesAndLogout(['Super Admin'])], complaintController.updateComplaint);
route.delete('/complaint/delete/:id', [mid.checkRolesAndLogout(['Super Admin'])], complaintController.deleteComplaint);

module.exports = route;