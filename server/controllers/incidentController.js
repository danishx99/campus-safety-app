const Incident = require("../schemas/Incident.js");
const User = require("../schemas/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.aggregate([
      {
        $lookup: {
          from: "users", // Make sure this matches the name of your users collection
          localField: "reportedBy",
          foreignField: "email",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true, // Preserve incidents without user details
        },
      },
      {
        $addFields: {
          firstName: { $ifNull: ["$userDetails.firstName", "Unknown"] },
          lastName: { $ifNull: ["$userDetails.lastName", "User"] },
        },
      },
      {
        $sort: {
          status: 1, // Sort by status
          createdAt: 1, // Then by createdAt
        },
      },
    ]);

    res.status(200).json({
      message: "Incidents fetched successfully",
      incidents: incidents,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching incidents" });
  }
};

exports.reportIncident = async (req, res) => {
  //get jwt token from cookies
  // const token = req.cookies.token;
  // const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // const email = decoded.email;

  //for testing purposes
  const email = "2544233test@students.wits.ac.za";

  try {
    const { title, type, description, location, image, date } = req.body;
    const incident = new Incident({
      title,
      type,
      description,
      location,
      image,
      reportedBy: email,
      date,
    });
    await incident.save();
    res.status(201).json({ message: "Incident reported successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error reporting incident" });
  }
};

exports.getUserDetails = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User successfully fetched", user: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching user" });
  }
};

exports.deleteAllIncidents = async (req, res) => {
  try {
    await Incident.deleteMany();
    res.status(200).json({ message: "All incidents deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting incidents" });
  }
};

exports.updateIncidentStatus = async (req, res) => {
  const { incidents } = req.body; // Expecting an array of { incidentId, status }
  try {
    // Loop through each incident and update the status
    for (const { incidentId, status } of incidents) {
      await Incident.findByIdAndUpdate(incidentId, { status });
    }

    res.status(200).json({ message: "Incident statuses updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating incident statuses" });
  }
};
