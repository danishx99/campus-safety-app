const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/profile', authMiddleware.verifyToken, profileController.getProfile);
router.put('/profile', authMiddleware.verifyToken, profileController.updateProfile);
router.put('/profile/password', authMiddleware.verifyToken, profileController.updatePassword);

module.exports = router;