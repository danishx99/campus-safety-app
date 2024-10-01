const express = require("express");
const router = express.Router();
const emergencyAlertController = require("../controllers/emergencyController");

// User Incident Reporting
router.post(
  "/sendPanic",
  emergencyAlertController.sendPanic
);

//Get the current emergency alert details
router.get(
  "/getEmergencyAlert/:emergencyAlertId",
  emergencyAlertController.getEmergencyAlertDetails
);

//Find and notify admins
router.post(
  "/notifyAdminsByProximity",
  emergencyAlertController.findAndNotifyAdmins
);


module.exports = router;