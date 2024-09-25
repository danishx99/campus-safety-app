const express = require("express");
const router = express.Router();
const emergencyAlertController = require("../controllers/emergencyController");

// User Incident Reporting
router.post(
  "/sendPanic",
  emergencyAlertController.sendPanic
);

router.get(
  "/getPanicStatus",
  emergencyAlertController.getPanicStatus
);

module.exports = router;