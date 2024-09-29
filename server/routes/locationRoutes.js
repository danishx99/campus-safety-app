const express = require('express');
const router = express.Router();
const locationUpdateController = require('../controllers/locationUpdateController');

const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/update', authMiddleware, locationUpdateController.updateLocation);

module.exports = router;