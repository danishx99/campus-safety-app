const express = require("express");
const router = express.Router();
const path = require("path");
const { homeRedirect } = require("../middlewares/homeRedirect");

router.get("/", (req, res) => {
  homeRedirect(req, res);
});

router.get("/login", (req, res) => {
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

router.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/html", "adminDashboard.html"));
});

router.get("/user", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/html", "userDashboard.html"));
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
