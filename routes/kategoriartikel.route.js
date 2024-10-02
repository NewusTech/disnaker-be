const kategoriartikelController = require('../controllers/kategoriartikel.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.post('/kategoriartikel/create', [mid.checkRolesAndLogout(['Super Admin'])], kategoriartikelController.createkategoriartikel);
route.get('/kategoriartikel/get', kategoriartikelController.getkategoriartikel); 
route.get('/kategoriartikel/get/:id', kategoriartikelController.getkategoriartikelById); 
route.put('/kategoriartikel/update/:id', [mid.checkRolesAndLogout(['Super Admin'])], kategoriartikelController.updatekategoriartikel); 
route.delete('/kategoriartikel/delete/:id', [mid.checkRolesAndLogout(['Super Admin'])], kategoriartikelController.deletekategoriartikel);

module.exports = route;