const express = require("express");
const router = express.Router();
const path = require("path");

const {homeRedirect} = require("../middlewares/homeRedirect");
const { isAdmin } = require("../middlewares/isAdmin");
const {isLoggedIn} = require("../middlewares/isLoggedIn");

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

//Admin Dashboard
router.get("/admin", isAdmin ,(req, res) => {
  res.sendFile(path.join(__dirname, "../../client/html", "adminDashboard.html"));
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

router.get("/profileManagement", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../client/html", "profileManagement.html")
  );
});

module.exports = router;
