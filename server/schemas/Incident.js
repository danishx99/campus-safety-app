const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const incidentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    image: {
      data: Buffer,
      contentType: String,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: false,
      enum: ["Pending", "In progress", "Resolved"],
      default: "Pending",
    },
    reportedBy: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Incident = mongoose.model("Incident", incidentSchema);

module.exports = Incident;
