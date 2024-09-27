const Incident = require("../schemas/Incident.js");
const User = require("../schemas/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const notification = require("../schemas/notification");

const _sendNotification = require("../utils/sendNotification");

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
          createdAt: -1, // Then by createdAt
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

// exports.getIncidents = async (req, res) => {
//   try {
//     const incidents = await Incident.find();
//     res.status(200).json({
//       message: "Incidents fetched successfully",
//       incidents: incidents,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Error fetching incidents" });
//   }
// }

exports.reportIncident = async (req, res) => {
  //get jwt token from cookies
  const token = req.cookies.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const email = decoded.userEmail;

  try {
    const { title, type, description, location, image, date } = req.body;

    //only use image if it is not null
    let imageBase64 = null;
    if (image) {
      imageBase64 = image;
    }

    //console.log("Image: ", imageBase64);

    const incident = new Incident({
      title,
      type,
      description,
      location,
      image: imageBase64 || null,
      reportedBy: email,
      date,
    });

    //console.log(incident);

    await incident.save();

    //Create a notification for the incident
    const newNotification = new notification({
      recipient: "admin",
      sender: email,
      read: false,
      message: "A new incident has been reported by " + email+ " , please check the incident tab for more details",
      title: "Incident Reported",
      notificationType: "incidentReported",
    });

    const savedNotification = await newNotification.save();



    //Get all admin FCM tokens
    const users = await User.find({ role: "admin" });
    fcmTokens = users.map((user) => user.FCMtoken);



    //Send notification
    await _sendNotification(
      fcmTokens,
      "Incident Reported",
      "A new incident has been reported by " + email+ " , please check the incident tab for more details",
      {
        notificationType: "Incident reported",
        sender: email,
        senderLocation: location,
        recipient: "admin",
      },
    );
    
        



    res.status(200).json({ message: "Incident reported successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error while reporting incident" });
    console.log(error);
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
    console.log(error);
    res.status(500).json({ error: "Error updating incident statuses" });
  }
};

exports.getIncidentByUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.userEmail;

    const incidents = await Incident.aggregate([
      {
        $match: { reportedBy: email },
      },
      {
        $lookup: {
          from: "users",
          localField: "reportedBy",
          foreignField: "email",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
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
          status: 1,
          createdAt: -1,
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
