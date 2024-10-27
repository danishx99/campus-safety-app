const Incident = require("../schemas/Incident.js");
const User = require("../schemas/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const notification = require("../schemas/notification");

const _sendNotification = require("../utils/sendNotification");

exports.getIncidents = async (req, res) => {
  try {
    //Start timing
    console.time("getIncidents");
    // Fetch all incidents exlcuding the image field
    const incidents = await Incident.find().select("-image").sort({
      status: 1,
      date: -1,
    });

    //End timing
    console.timeEnd("getIncidents");

    console.time("findUniqueReporters");
    // Extract all unique reportedBy emails from the incidents
    const reportedByEmails = [
      ...new Set(incidents.map((incident) => incident.reportedBy)),
    ];
    //End timing
    console.timeEnd("findUniqueReporters");

    console.time("getUsersDeatils");
    // Fetch user details for the reportedBy emails
    const users = await User.find({ email: { $in: reportedByEmails } }).select(
      "-profilePicture"
    );
    console.timeEnd("getUsersDeatils");

    console.time("lookupMap");
    // Create a lookup map for users by email for efficient merging
    const userMap = users.reduce((acc, user) => {
      acc[user.email] = user;
      return acc;
    }, {});
    console.timeEnd("lookupMap");

    console.time("attachUserDetails");

    // Attach user details to each incident
    const incidentsWithUserDetails = incidents.map((incident) => {
      const user = userMap[incident.reportedBy] || {};
      return {
        ...incident._doc, // Spread incident data
        userDetails: {
          firstName: user.firstName || incident.firstName || "Unknown", // Accessing firstName
          lastName: user.lastName || incident.lastName || "Unknown", // Accessing lastName
          email: incident.reportedBy || "Not provided", // Accessing email
          phone: user.phone || "Not provided", // Accessing phone
          role: user.role || "Not specified", // Accessing role
          // profilePicture: user.profilePicture || "../assets/user-profile.webp", // Accessing profile picture
          externalUser: incident.group ? true : false,
        },
      };
    });

    console.timeEnd("attachUserDetails");

    // console.log("bruhhhhhhhh", incidentsWithUserDetails.length); // Start timing

    // for (let incident of incidentsWithUserDetails) {
    //   console.log(incident.date);
    // }

    res.status(200).json({
      message: "Incidents fetched successfully",
      incidents: incidentsWithUserDetails,
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

    let imageTrue = false;

    //only use image if it is not null
    let imageBase64 = null;
    if (image) {
      imageTrue = true;
      imageBase64 = image;
    }

    //console.log("Image: ", imageBase64);

    const incident = new Incident({
      title,
      type,
      description,
      location,
      image: imageBase64 || null,
      imageTrue,
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
      message:
        "A new incident has been reported by " +
        email +
        " , please check the incident tab for more details",
      title: "Incident Reported: " + title,
      notificationType: "Incident reported",
    });

    const savedNotification = await newNotification.save();

    //Get all admin FCM tokens
    const users = await User.find({ role: "admin" });
    fcmTokens = users.map((user) => user.FCMtoken);

    //Send notification
    await _sendNotification(fcmTokens, {
      title: "Incident Reported: " + title,
      body: "A new incident has been reported. Please check the incidents page for more details.",
      notificationType: "Incident reported",
      sender: email,
      senderLocation: location,
      recipient: "admin",
      url: "/admin/viewIncidents",
    });

    res.status(200).json({ message: "Incident reported successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error while reporting incident" });
    console.log(error);
  }
};

exports.reportExternalIncident = async (req, res) => {
  try {
    const token = req.params.token;

    if (token !== process.env.EXTERNAL_GROUP_TOKEN) {
      return res.status(401).json({
        error:
          "You are not authorized to report incidents. Please get a valid token",
      });
    }

    const {
      title,
      description,
      location,
      image,
      date,
      reportedBy,
      firstName,
      lastName,
      group,
    } = req.body;

    let imageTrue = false;

    //only use image if it is not null
    let imageBase64 = null;
    if (image) {
      imageTrue = true;
      imageBase64 = image;
    }

    const incident = new Incident({
      title,
      description,
      location,
      image: imageBase64 || null,
      imageTrue,
      reportedBy,
      firstName,
      lastName,
      group,
      date,
    });

    //

    await incident.save();

    //Create a notification for the incident
    const newNotification = new notification({
      recipient: "admin",
      sender: reportedBy,
      read: false,
      message:
        "A new external incident has been reported by " +
        reportedBy +
        " , please check the incident tab for more details",
      title: "External Incident Reported",
      notificationType: "Incident reported",
    });

    await newNotification.save();

    //Send notification to all admins
    const users = await User.find({ role: "admin" });
    fcmTokens = users.map((user) => user.FCMtoken);

    //Send notification
    await _sendNotification(fcmTokens, {
      title: "External Incident Reported",
      body: "A new external incident has been reported. Please check the incident tab for more details.",
      notificationType: "Incident reported",
      sender: reportedBy,
      senderLocation: location,
      recipient: "admin",
      url: "/admin/viewIncidents",
    });

    //Send success response
    res.status(200).json({ message: "Incident reported successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error while reporting incident" });
    console.log(error);
  }
};
exports.getIncidentsByGroup = async (req, res) => {
  try {
    const token = req.params.token;
    const group = req.params.group;

    // Debugging: log the token and group
    console.log("Received token:", token);
    console.log("Environment token:", process.env.EXTERNAL_GROUP_TOKEN);
    console.log("Received group:", group);

    if (token.trim() !== process.env.EXTERNAL_GROUP_TOKEN.trim()) {
      return res.status(401).json({
        error:
          "You are not authorized to view incidents. Please get a valid token",
      });
    }

    // Fetch incidents by group
    const incidents = await Incident.find({ group });

    // Debugging: log the incidents fetched
    console.log("Incidents fetched:", incidents);

    res
      .status(200)
      .json({ message: "Incidents fetched successfully", incidents });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error while fetching incidents" });
    console.log(error);
  }
};

exports.getIncidentImage = async (req, res) => {
  const { incidentId } = req.params;
  console.log("Incident ID: ", incidentId);

  // Return an HTML page with the image
  try {
    const incident = await Incident.findById(incidentId).select("image");

    if (!incident) {
      return res.status(404).send("<h1>Incident not found</h1>");
    }

    if (!incident.image) {
      return res.status(404).send("<h1>Image not found</h1>");
    }
    let imageSrc;
    //check if the image already has the data URI prefix before adding it
    if (incident.image.includes("data:image")) {
      imageSrc = incident.image;
    } else {
      imageSrc = `data:image/png;base64,${incident.image}`;
    }

    // Return HTML page with the base64 image taking up the entire page
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body, html {
              margin: 0;
              padding: 0;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: #f4f4f4;
            }
            img {
              max-width: 100%;
              max-height: 100%;
              object-fit: cover;
            }
          </style>
          <title>Incident Image</title>
        </head>
        <body>
          <img src="${imageSrc}" alt="Incident Image">
        </body>
      </html>
    `;

    res.status(200).send(html);
  } catch (error) {
    console.log(error);
    res.status(500).send("<h1>Error fetching image</h1>");
  }
};

// exports.getUserProfilePicture = async (req, res) => {
//   const { userEmail } = req.params;

//   try {
//     const user = await User.findOne({ email: userEmail }).select(
//       "profilePicture"
//     );

//     if (!user) {
//       return res.status(404).send("<h1>User not found</h1>");
//     }

//     if (!user.profilePicture) {
//       return res.status(404).send("<h1>Profile picture not found</h1>");
//     }

//     // let imageSrc = `data:image/png;base64,${user.profilePicture}`;
//     // Convert base64 to buffer
//     const imageBuffer = Buffer.from(user.profilePicture, "base64");

//     console.log("Image buffer:", imageBuffer);

//     // Set headers for image response
//     res.set({
//       "Content-Type": "image/png", // Adjust if you support other image types
//       "Content-Length": imageBuffer.length,
//       "Cache-Control": "public, max-age=86400", // Cache for 24 hours
//     });

//     // Send the image buffer directly
//     return res.status(200).send(imageBuffer);

//     // //Return the base64 image as a string

//     // res.status(200).json({ image: imageSrc });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("<h1>Error fetching image</h1>");
//   }
// };

exports.getUserProfilePicture = async (req, res) => {
  const { userEmail } = req.params;

  try {
    const user = await User.findOne({ email: userEmail }).select(
      "profilePicture"
    );

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Get the base64 string
    let base64String = user.profilePicture;

    // If the string already contains the data URI prefix, remove it
    if (base64String.includes("data:image")) {
      base64String = base64String.split(";base64,")[1];
    }

    try {
      // Convert base64 to buffer
      const imageBuffer = Buffer.from(base64String, "base64");

      // Detect content type (you can make this more sophisticated if needed)
      let contentType = "image/jpeg"; // default
      if (base64String.startsWith("/9j/")) {
        contentType = "image/jpeg";
      } else if (base64String.startsWith("iVBORw0KGgo")) {
        contentType = "image/png";
      }

      // Set the appropriate headers
      res.set({
        "Content-Type": contentType,
        "Content-Length": imageBuffer.length,
        "Cache-Control": "no-cache",
      });

      // Send the buffer
      return res.send(imageBuffer);
    } catch (bufferError) {
      console.error("Buffer conversion error:", bufferError);
      return res.status(500).send("Error processing image data");
    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).send("Error fetching image");
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
  const { incidents } = req.body; // Array of { incidentId, status }

  // Get JWT token from cookies
  const token = req.cookies.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const adminEmail = decoded.userEmail;

  console.time("updateIncidentStatus"); // Start timing

  const fcmTokens = [];

  // Send notification to the users whose incident status has been changed
  for (const incident of incidents) {
    try {
      // Find the incident by its ID
      const myIncident = await Incident.findById(incident.incidentId);
      if (!myIncident) {
        console.log(`Incident with ID ${incident.incidentId} not found`);
        continue; // Skip to the next iteration if the incident is not found
      }

      // Find the user who reported the incident
      const user = await User.findOne({ email: myIncident.reportedBy });
      if (user && !fcmTokens.includes(user.FCMtoken)) {
        fcmTokens.push(user.FCMtoken);

        // Create and save a new notification
        const newNotification = new notification({
          recipient: user.email,
          sender: adminEmail,
          read: false,
          message:
            "The status of one or more incidents has been updated. Please check the incidents page for more details.",
          title: "Incident Status Update",
          notificationType: "Incident update",
        });

        await newNotification.save();

        // Send notification
        await _sendNotification([user.FCMtoken], {
          title: "Incident Status Update",
          body: "The status of one or more of your incidents has been updated. Please check the incidents page for more details.",
          notificationType: "Incident status update",
          sender: adminEmail,
          recipient: user.email,
          url: "/user/viewPastIncidents",
        });
      }
    } catch (error) {
      console.error("Error processing incident:", error);
    }
  }

  try {
    // Perform a bulk update for all the incident statuses
    const bulkOps = incidents.map(({ incidentId, status }) => ({
      updateOne: {
        filter: { _id: incidentId },
        update: { status },
      },
    }));

    // Execute the bulk update
    await Incident.bulkWrite(bulkOps);

    res.status(200).json({ message: "Incident statuses updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating incident statuses" });
  }
};

exports.getIncidentByUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.userEmail; // Get the email from the decoded token

    // Fetch all incidents reported by the user
    const incidents = await Incident.find({ reportedBy: email })
      .select("-image")
      .sort({
        status: 1,
        date: -1,
      });

    // Fetch user details based on the email
    const users = await User.find({ email }); // Fetch user by email

    // Create a lookup map for the user details
    const userMap = users.reduce((acc, user) => {
      acc[user.email] = user; // Store user by email
      return acc;
    }, {});

    // Attach user details to each incident
    const incidentsWithUserDetails = incidents.map((incident) => {
      const user = userMap[email] || {}; // Get user details or empty object

      return {
        ...incident._doc, // Spread incident data
        userDetails: {
          firstName: user.firstName || "Unknown", // Accessing firstName
          lastName: user.lastName || "User", // Accessing lastName
          email: user.email || "Not provided", // Accessing email
          phone: user.phone || "Not provided", // Accessing phone
          role: user.role || "Not specified", // Accessing role
          profilePicture: user.profilePicture || "../assets/user-profile.webp", // Accessing profile picture
        },
      };
    });

    res.status(200).json({
      message: "Incidents fetched successfully",
      incidents: incidentsWithUserDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching incidents" });
  }
};
