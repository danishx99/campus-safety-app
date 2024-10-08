const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const incidentController = require("../controllers/incidentController");

// User Incident Reporting
router.post(
  "/reportIncident",

  incidentController.reportIncident
);

//Report incident external group
router.post("/reportExternalIncident/:token", incidentController.reportExternalIncident);

//Get all incidents by group
router.get("/getIncidentsByGroup/:group/:token", incidentController.getIncidentsByGroup);


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

router.get("/getIncidentByUser",
  //authMiddleware.verifyToken,
  incidentController.getIncidentByUser
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

router.get(
  "/getIncidentImage/:incidentId",
  //authMiddleware.verifyToken,
 incidentController.getIncidentImage
);

module.exports = router;
