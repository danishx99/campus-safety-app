const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Get currently logged in user information
router.get("/getCurrentUser", (req, res) =>
    profileController.getUserDetails(req, res)
);

// Update currently logged in user information
router.put("/updateUserDetails", (req, res) =>
    profileController.updateUserDetails(req, res)
);

module.exports = router;