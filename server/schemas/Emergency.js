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
    radiusBeingSearched: {
      type: Number,
      required: false,
     
    },

    assignedTo: {
      type: String,
      required: false,
    },
    
    status: {
      type: String,
      required: false,
      enum: ["Searching", "Assigned", "Resolved", "Cancelled"],
      default: "Searching",
    },

},  
{
  timestamps: true,
}
);

const emergency = mongoose.model("Emergency", emergencySchema);

module.exports = emergency;
