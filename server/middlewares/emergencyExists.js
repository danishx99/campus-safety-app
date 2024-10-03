const dotenv = require("dotenv");
const Emergency = require("../schemas/Emergency");
const path = require("path");
const mongoose = require("mongoose");

dotenv.config();

exports.emergencyExists = async (req, res, next) => {
  try {
    const emergencyAlertId = req.params.emergencyId;

    // Check if emergencyAlertId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(emergencyAlertId)) {
      console.error("Invalid Emergency Alert ID");
      return res.sendFile(
        path.join(__dirname, "../../client/html/error", "notFound404.html")
      );
    }

    // Find the emergency by the valid ObjectId
    const emergency = await Emergency.findById(emergencyAlertId);

    console.log("Emergency alert:", emergency);

    // If no emergency or if status is "Cancelled", return the 404 error page
    if (!emergency || emergency.status === "Cancelled") {
      return res.sendFile(
        path.join(__dirname, "../../client/html/error", "notFound404.html")
      );
    }

    // Proceed to the next middleware if the emergency is valid
    next();
  } catch (error) {
    console.error("Error verifying emergency alert:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
