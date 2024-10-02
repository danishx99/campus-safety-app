const express = require("express");
const router = express.Router();
const emergencyAlertController = require("../controllers/emergencyController");

// User Incident Reporting
router.post("/sendPanic", emergencyAlertController.sendPanic);

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

//Assign an emergency alert to an admin tempUpdateEmergency
router.get(
  "/assign/:emergencyAlertId",
  emergencyAlertController.tempUpdateEmergency
);

router.get(
  "/getEmergencyAlertsByUser",
  emergencyAlertController.getEmergencyAlertsByUser
);


module.exports = router;
