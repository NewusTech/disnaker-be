const artikelController = require('../controllers/artikel.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/artikel/create', [mid.checkRolesAndLogout(['Super Admin'])], upload.single('image'), artikelController.createartikel);
route.get('/artikel/get', artikelController.getartikel); 
route.get('/artikel/get/:slug', artikelController.getartikelBySlug); 
route.put('/artikel/update/:slug', [mid.checkRolesAndLogout(['Super Admin'])], upload.single('image'), artikelController.updateartikel); 
route.delete('/artikel/delete/:slug', [mid.checkRolesAndLogout(['Super Admin'])], artikelController.deleteartikel);

module.exports = route;