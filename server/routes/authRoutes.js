const express= require('express');
const path = require('path');
const authController= require("../controllers/authController");
const router= express.Router();

router.post("/register", async (req,res )=> authController.register(req,res));

module.exports = router;
