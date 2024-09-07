const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const incidentController = require("../controllers/incidentController");

// User Incident Reporting
router.post(
  "/reportIncident",
  authMiddleware.verifyToken,
  incidentController.reportIncident
);

module.exports = router;
