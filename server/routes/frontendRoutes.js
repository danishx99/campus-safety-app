const express = require("express");
const router = express.Router();
const path = require("path");

// router.get('/', (req,res)=>{
//     res.sendFile(path.join(__dirname,'../public/login.html'));
// });

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/html/auth", "login.html"));
});

router.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/html/auth", "register.html"));
});

router.get("/forgotPassword", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../client/html/auth", "forgotPassword.html")
  );
});

router.get("/resetPassword", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../client/html/auth", "resetPassword.html")
  );
});

router.get("/verifyEmail", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../client/html/auth", "verifyEmail.html")
  );
});

router.get("/adminDashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/html", "index.html"));
});

router.get("/user/reportIncident", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../client/html", "userIncidentReporting.html")
  );
});

router.get("/admin/viewIncidents", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../client/html", "adminIncidentReporting.html")
  );
});

router.get("/admin/safetyResources", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../client/html", "adminSafetyResources.html")
  );
});

router.get("/user/safetyResources", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../client/html", "userSafetyResources.html")
  );
});

router.get("/profileManagement", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../client/html", "profileManagement.html")
  );
});

module.exports = router;
