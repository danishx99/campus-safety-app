const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Get currently logged in user information
router.post("/sendNotification", notificationController.sendNotification);


module.exports = router;