const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

const { isAdmin } = require('../middlewares/isAdmin');

// Get currently logged in user information
router.post("/sendNotification" ,isAdmin, notificationController.sendNotification);


module.exports = router;