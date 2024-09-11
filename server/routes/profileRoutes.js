const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile);
router.put('/profile/password', profileController.updatePassword);

module.exports = router;