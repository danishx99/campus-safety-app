const express= require('express');
const path = require('path');
const adminController= require("../controllers/adminController");
const router= express.Router();

router.post("/adminSafetyResources", async (req,res )=> adminController.adminSafetyResources(req,res));

module.exports = router;