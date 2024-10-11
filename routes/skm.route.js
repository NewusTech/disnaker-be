const skmController = require('../controllers/skm.controller');

const mid = require('../middlewares/auth.middleware');
const express = require('express');
const route = express.Router();

route.get('/skm/get', [mid.checkWithPermissions(['Master Data'])], skmController.getSkm);
module.exports = route