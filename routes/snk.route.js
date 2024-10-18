const snkController = require('../controllers/snk.controller');

const mid = require('../middlewares/auth.middleware');
const express = require('express');
const route = express.Router();

route.get('/snk/get', [mid.checkRoles()], snkController.getSnk);
route.get('/snk/update', [mid.checkRolesAndLogout(['Super Admin'])], snkController.updateSnk);
module.exports = route