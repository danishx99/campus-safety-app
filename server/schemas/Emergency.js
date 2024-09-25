const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const emergencySchema = new Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    location: {
      type: String,
      required: true,
    },
    reportedBy: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: false,
      enum: ["Received", "Admin Assigned", "Help on the Way"],
      default: "Received",
    },
},  
);

const emergency = mongoose.model("Emergency", emergencySchema);

module.exports = emergency;
