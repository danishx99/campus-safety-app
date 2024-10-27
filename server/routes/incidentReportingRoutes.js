const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const incidentController = require("../controllers/incidentController");
const { isAdmin } = require("../middlewares/isAdmin");
const { isUser } = require("../middlewares/isUser");

// User Incident Reporting
router.post("/reportIncident", isUser, incidentController.reportIncident);

//Report incident external group
router.post(
  "/reportExternalIncident/:token",
  incidentController.reportExternalIncident
);

//Get all incidents by group
router.get(
  "/getIncidentsByGroup/:group/:token",
  incidentController.getIncidentsByGroup
);

router.get("/getIncidents", isAdmin, incidentController.getIncidents);

router.get("/getIncidentByUser", isUser, incidentController.getIncidentByUser);

router.put("/updateIncident", isAdmin, incidentController.updateIncidentStatus);

router.get(
  "/getIncidentImage/:incidentId",
  authMiddleware,
  incidentController.getIncidentImage
);

router.get(
  "/getUserProfilePicture/:userEmail",
  authMiddleware,
  incidentController.getUserProfilePicture
);

module.exports = router;
