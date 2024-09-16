const express = require("express");
const router = express.Router();
const path = require("path");

const {homeRedirect} = require("../middlewares/homeRedirect");
const { isAdmin } = require("../middlewares/isAdmin");
const {isLoggedIn} = require("../middlewares/isLoggedIn");
const { isUser } = require("../middlewares/isUser");
const { authMiddleware } = require("../middlewares/authMiddleware");

// router.get('/', (req,res)=>{
//     res.sendFile(path.join(__dirname,'../public/login.html'));
// });

router.get("/" ,(req, res) => {
  homeRedirect(req, res);
});

router.get("/register", isLoggedIn("register") ,(req, res) => {

});

router.get("/login", isLoggedIn("login") ,(req, res) => {
 
}
);

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

//Admin send Notifications
router.get("/admin/sendNotifications",isAdmin,(req, res) => {
  res.sendFile(
    path.join(__dirname, "../../client/html", "sendNotifications.html")
  );
});

//Admin Dashboard
router.get("/admin", isAdmin ,(req, res) => {
  res.sendFile(path.join(__dirname, "../../client/html", "adminDashboard.html"));
});

//User Dashboard
router.get("/user", isUser, (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/html", "userDashboard.html"));
});

//Incident Reporting
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

router.get("/admin/generateCode", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../client/html", "adminGenerateCode.html")
  );
});

//Safety Resources
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

router.get("/admin/viewSafetyResources", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../client/html", "adminSafetyResources2.html")
  );
});

router.get("/admin/updateSafetyResources", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../client/html", "adminSafetyResources3.html")
  );
});

router.get("/profileManagement", authMiddleware ,(req, res) => {
  res.sendFile(
    path.join(__dirname, "../../client/html", "profileManagement.html")
  );
});

router.get("/panic", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../client/html", "panicButton.html")
  );
});

module.exports = router;
