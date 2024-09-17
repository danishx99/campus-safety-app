const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

const { isAdmin } = require('../middlewares/isAdmin');
const { authMiddleware } = require('../middlewares/authMiddleware');


router.post("/sendNotification" ,isAdmin, notificationController.sendNotification);

//Get all unread notifications
router.get("/getUnreadNotifications", authMiddleware, notificationController.getUnreadNotifications);

//Get all notifications
router.get("/getAllNotifications", authMiddleware, notificationController.getAllNotifications);

//Get notification history sent out by user
router.get("/getNotificationHistory", authMiddleware, notificationController.getNotificationHistory);


router.get("/redirectToNotificationPage", authMiddleware, notificationController.redirectToNotificationPage);

module.exports = router;