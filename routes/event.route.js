const eventController = require('../controllers/event.controller');
const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/event/create', [mid.checkRoles()], upload.single('image'), eventController.createEvent);
route.get('/event/get', [mid.checkRoles()], eventController.getEvent);
route.get('/event/get/:slug', [mid.checkRoles()], eventController.getEventById);
route.put('/event/update/:slug', [mid.checkRoles()], upload.single('image'), eventController.updateEvent);
route.delete('/event/delete/:slug', [mid.checkRoles()], eventController.deleteEvent);

module.exports = route;