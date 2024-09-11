const express= require('express');
const path = require('path');
const authController= require("../controllers/authController");
const router= express.Router();

router.post("/register", async (req,res )=> authController.register(req,res));
router.post("/login", async (req,res )=> authController.login(req,res));
router.post("/googleRegister", async (req,res )=> authController.googleRegister(req,res));
router.post("/googleLogin", async (req,res )=> authController.googleLogin(req,res));
router.post("/isVerified", async (req,res )=> authController.isVerified(req,res));
router.post("/sendVerification", async (req,res )=> authController.sendVerification(req,res));
router.post("/resetPassword", async (req,res )=> authController.resetPassword(req,res));
router.post("/forgotPassword", async (req,res )=> authController.forgotPassword(req,res));
router.post("/verifyEmail", async (req,res )=> authController.verifyEmail(req,res));
router.post("/logout", async (req,res) => authController.logout(req,res));
router.get("/checkEmailVerification", async (req, res) => authController.checkEmailVerification(req, res));

module.exports = router;