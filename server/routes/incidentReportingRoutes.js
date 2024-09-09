const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const incidentController = require("../controllers/incidentController");

// User Incident Reporting
router.post(
  "/reportIncident",

  incidentController.reportIncident
);

router.get(
  "/getIncidents",
  //authMiddleware.verifyToken,
  incidentController.getIncidents
);

router.get(
  "/getUserDetails",
  //authMiddleware.verifyToken,
  incidentController.getUserDetails
);

router.put(
  "/updateIncident",
  //authMiddleware.verifyToken,
  incidentController.updateIncidentStatus
);

router.delete(
  "/deleteAllIncidents",
  //authMiddleware.verifyToken,
  incidentController.deleteAllIncidents
);

module.exports = router;
