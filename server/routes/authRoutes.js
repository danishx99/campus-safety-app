const express= require('express');
const path = require('path');
const authController= require("../controllers/authController");
const router= express.Router();

router.post("/register", async (req,res )=> authController.register(req,res));
router.post("/login", async (req,res )=> authController.login(req,res));
router.post("/resetPassword", async (req,res )=> authController.resetPassword(req,res));
router.post("/forgotPassword", async (req,res )=> authController.forgotPassword(req,res));
router.post("/verifyEmail", async (req,res )=> authController.verifyEmail(req,res));

module.exports = router;