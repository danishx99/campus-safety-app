const express= require('express');
const path = require('path');
const { userSafetyResources }= require("../controllers/userController");
const router= express.Router();

router.get('/userSafetyResources', userSafetyResources);

module.exports = router;