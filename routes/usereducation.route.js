const usereducationController = require('../controllers/usereducation.controller');

const mid = require('../middlewares/auth.middleware');
const express = require('express');
const route = express.Router();

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const multipleUpload = upload.fields([{ name: 'fileIjazah', maxCount: 1 }, { name: 'fileTranskrip', maxCount: 1 }]);


route.post('/user/education/create', [mid.checkRolesAndLogout(['User'])], multipleUpload, usereducationController.createusereducation);
route.get('/user/education/get', [mid.checkRolesAndLogout(['User'])], usereducationController.getusereducation);
module.exports = route;