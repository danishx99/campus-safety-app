const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const incidentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String, //e.g Theft, Assualt, Harassment, Vandalism, Other
      required: true,
    },
    image: { //BASE64 string (optional)
      type: String,
    },
    imageTrue: {
      type: Boolean,
      required: false,
      default: false,
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
    firstName: { //For external group
      type: String,
    },
    lastName: { //For external group
      type: String,
    },

    date: {//Date event occured
      type: String,
      required: true,
    },
    group: {
      type: String,
      required: false,
      enum: ["events", "transportation", ""],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Incident = mongoose.model("Incident", incidentSchema);

module.exports = Incident;
