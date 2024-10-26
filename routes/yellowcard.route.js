const yellowcardController = require('../controllers/yellowcard.controller');
const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/yellowcard/create', [mid.checkRolesAndLogout(['User'])], yellowcardController.createYellowCard);
route.get('/yellowcard/get', [mid.checkRoles()], yellowcardController.getYellowCard);
route.get('/yellowcard/get/:id', [mid.checkRoles()], yellowcardController.getYellowCardById);
route.put('/yellowcard/update/:id', [mid.checkRolesAndLogout(['Super Admin'])], yellowcardController.updateYellowCard);
route.delete('/yellowcard/delete/:id', [mid.checkRolesAndLogout(['Super Admin'])], yellowcardController.deleteYellowCard);
route.get('/yellowcard/generate/:id', [mid.checkRolesAndLogout(['User', 'Super Admin'])], yellowcardController.generateYellowCard);

module.exports = route;