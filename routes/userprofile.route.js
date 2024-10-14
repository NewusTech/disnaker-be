const userprofileController = require('../controllers/userprofile.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const multipleUpload = upload.fields([{ name: 'ktp', maxCount: 1 }, { name: 'kk', maxCount: 1 }]);

route.get('/user/profile/get', [mid.checkRolesAndLogout(['User'])], userprofileController.getUserProfile);
// route.delete('/userprofile/delete/:slug', [mid.checkRolesAndLogout(['Super Admin'])], userprofileController.deleteuser);

route.put('/user/profile/update/:slug', [mid.checkRolesAndLogout(['User'])], multipleUpload, userprofileController.updateuserprofile);
route.put('/user/about/update/:slug', [mid.checkRolesAndLogout(['User'])], userprofileController.updateaboutuser);
route.put('/user/image-profile/update/:slug', [mid.checkRolesAndLogout(['User'])], upload.single('image'), userprofileController.updateImageProfile);
route.put('/user/cv-portfolio/upload/:slug', [mid.checkRolesAndLogout(['User'])], upload.fields([{ name: 'cv', maxCount: 1 }, { name: 'portfolio', maxCount: 1 }]), userprofileController.uploadDocCvPortfolio); 
// route.put('/userprofile/updatefoto/:slug', [mid.checkRolesAndLogout(['Super Admin'])], upload.single('fotoprofil'), userprofileController.updateprofil); 

module.exports = route;