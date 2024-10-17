const transmigrationController = require('../controllers/transmigration.controller');
const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/transmigration/create', [mid.checkRolesAndLogout(['User'])], upload.single('file'), transmigrationController.createTransmigration);
route.get('/transmigration/get', [mid.checkRoles()], transmigrationController.getTransmigration);
route.get('/transmigration/get/:id', [mid.checkRoles()], transmigrationController.getTransmigrationById);
route.put('/transmigration/update/:id', [mid.checkRolesAndLogout(['Super Admin'])], transmigrationController.updateTransmigration);
route.delete('/transmigration/delete/:id', [mid.checkRolesAndLogout(['Super Admin'])], transmigrationController.deleteTransmigration);

module.exports = route;