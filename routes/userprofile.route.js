const userprofileController = require('../controllers/userprofile.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.get('/user/profile/application/get', [mid.checkRolesAndLogout(['User'])], userprofileController.getUserApplications);
route.get('/user/profile/get', [mid.checkRolesAndLogout(['User'])], userprofileController.getUserProfile);
route.post('/user/savevacancy', [mid.checkRolesAndLogout(['User'])], userprofileController.savevacancy);
route.get('/user/savedvacancy/get', [mid.checkRolesAndLogout(['User'])], userprofileController.getsavedVacancy);
// route.get('/userprofile/get', [mid.checkRolesAndLogout(['Super Admin'])], userprofileController.getuserdata); 
// route.get('/userprofile/get/:slug', [mid.checkRolesAndLogout(['Super Admin'])], userprofileController.getuserByslug); 
// route.delete('/userprofile/delete/:slug', [mid.checkRolesAndLogout(['Super Admin'])], userprofileController.deleteuser);

// route.post('/userprofile/create', [mid.checkRolesAndLogout(['Super Admin'])], userprofileController.createuserprofile); 
// route.put('/userprofile/update/:slug', [mid.checkRolesAndLogout(['Super Admin'])], userprofileController.updateuserprofile);
// route.put('/userprofile/updatefoto/:slug', [mid.checkRolesAndLogout(['Super Admin'])], upload.single('fotoprofil'), userprofileController.updateprofil); 

module.exports = route;