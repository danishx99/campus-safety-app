const Emergency = require("../schemas/Emergency");
const User = require("../schemas/User.js");
const notification = require("../schemas/notification");
const jwt = require("jsonwebtoken");
const Chat = require("../schemas/Chat");

const _sendNotification = require("../utils/sendNotification");
const emergency = require("../schemas/Emergency");

//placeholder logic for the handling the back end of the emergency alert system

exports.tempUpdateEmergency = async (req, res) => {
  try {
    const emergencyAlertId = req.params.emergencyAlertId;
    const assignedTo = "2458487@students.wits.ac.za";

    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const sender = decoded.userEmail;
    const user = await User.findOne({ email: sender });

    const findAdmindDetails = await User.findOne({ email: assignedTo });

    _sendNotification([user.FCMtoken], {
      emergencyAlertId,
      status: "Assigned",
      firstName: findAdmindDetails.firstName,
      lastName: findAdmindDetails.lastName,
      email: findAdmindDetails.email,
      phone: findAdmindDetails.phone,
    });

    //update the emergency alert with the assignedTo field and its status to "Assigned"
    await Emergency.findByIdAndUpdate(emergencyAlertId, {
      assignedTo,
      status: "Assigned",
    });

    res.status(200).json({ message: "Emergency alert assigned successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error updating emergency alert" });
  }
};

exports.sendPanic = async (req, res) => {
  try {
    const { title, description, location } = req.body;
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.userEmail;

    //Check if the user has an active emergency alert(so an emergency alert that doesnt have a status of "resolved" or "cancelled")
    const activeEmergency = await Emergency.findOne({
      reportedBy: email,
      status: { $nin: ["Resolved", "Cancelled"] },
    });

    if (activeEmergency) {
      return res.status(400).json({
        error:
          "You already have an active emergency alert. Please cancel it or wait for it to be resolved before issuing another one.",
      });
    }

    const newEmergency = new Emergency({
      title,
      description,
      location,
      reportedBy: email,
      // radiusBeingSearched: 200,
    });
    await newEmergency.save();

    const newNotification = new notification({
      recipient: "admin",
      sender: email,
      read: false,
      message: "Emergency Alert received from " + email,
      title: "Emergency Alert",
      notificationType: "emergency-alert",
    });

    await newNotification.save();

    // const users = await User.find({ role: "admin" });
    // fcmTokens = users.map((user) => user.FCMtoken);

    // //Send notification
    // await _sendNotification(fcmTokens, {
    //   : "Emergency Alert",
    //   body: "Emergency Alert received, click for more details",
    //   notificationType: "emergency-alert",
    //   sender: email,
    //   senderLocation: location,
    //   recipient: "admin",
    // });

    //Return the emergency object details to be stored as a cookie(the emergencyAlertId below thats returned was initialy so that a user can be redirected based on the alertID )
    res.cookie(`emergency-${newEmergency._id}`, JSON.stringify(newEmergency), {
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(200).json({
      message: "Emergency alert sent successfully",
      emergencyAlertId: newEmergency._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error sending emergency alert" });
  }
};

exports.getEmergencyAlertDetails = async (req, res) => {
  try {
    const emergencyAlertId = req.params.emergencyAlertId;
    const emergency = await Emergency.findById(emergencyAlertId);

    //Check if this emergency alert has been assigned to an admin , if it has , append the admin details to the response so that the client can display the admin details
    //Maybe in the future(when we have time), when users go to "http://127.0.0.1:3000/user/emergencyalerts/track/66fdc83c1d5e9598640a19c6",
    //and the emergency alert has been resolved, show the admin details that resolved the emergency alert, or just say this emergency alert has been resolved already
    if (emergency.status === "Assigned") {
      const assignedToAdmin = await User.findOne({
        email: emergency.assignedTo,
      });
      return res
        .status(200)
        .json({ emergencyAlert: emergency, adminData: assignedToAdmin });
    }

    res.status(200).json({ emergencyAlert: emergency });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching emergency alert" });
  }
};

exports.getEmergencyDetailsByEmergencyAlertId = async (req, res) => {
  try {
    const emergencyAlertId = req.params.emergencyAlertId;
    const emergency = await Emergency.findById(emergencyAlertId);

    const user = await User.findOne({ email: emergency.reportedBy });

    res.status(200).json({ emergency, reportedBy: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching emergency alert" });
  }
};

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function getUsersWithinRadius(users, baseLocation, radiusInKM) {
  //Filter through the users and store all of them that are in proximity in nearbyUsers array
  const nearbyUsers = users.filter((user) => {
    if (user.lastLocation) {
      const R = 6371; // Radius of the earth in km
      const [targetLon, targetLat] = [
        baseLocation.longitude,
        baseLocation.latitude,
      ]; //Base location
      const [userLon, userLat] = [
        JSON.parse(user.lastLocation)[1],
        JSON.parse(user.lastLocation)[0],
      ]; //User location that will be checked to be in the radius

      const dLat = deg2rad(userLat - targetLat);
      const dLon = deg2rad(userLon - targetLon);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(targetLat)) *
          Math.cos(deg2rad(userLat)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c; // Distance in km
      return d <= radiusInKM; // Return locations within certain radius(in km)
    }
  });
  return nearbyUsers;
}

async function checkIfAdminHasBeenAssigned(emergencyAlertId) {
  let emergency = await Emergency.findById(emergencyAlertId);
  console.log("the emergency is assigned to : ", emergency.assignedTo);
  return emergency.assignedTo;
}

async function checkIfCancelled(emergencyAlertId) {
  let emergency = await Emergency.findById(emergencyAlertId);
  return emergency.status === "Cancelled";
}

exports.findAndNotifyAdmins = async (req, res) => {
  try {
    const { emergencyAlertId, location } = req.body;
    const parsedLocation = JSON.parse(location);

    let count = 1;

    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const sender = decoded.userEmail;

    const user = await User.findOne({ email: sender });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Notify frontend to redirect
    await _sendNotification([user.FCMtoken], {
      emergencyAlertId,
      redirect: true,
      notificationType: "emergency-alert",
      userToBeRedirected: sender,
      currentSessionToken: token,
    });

    console.log(`User notified to redirect for the ${count} time`);

    count++;

    const proximities = [0.2, 0.5, 1, 1.5];
    const users = await User.find({ role: "admin" });

    for (const radius of proximities) {
      //Check if the emergency alert has been cancelled
      const cancelled = await checkIfCancelled(emergencyAlertId);
      if (cancelled) {
        // //Send notification to the client that the emergency alert has been cancelled(technically not needed because the client will be redirected to the home page when they cancel the alert)
        // await _sendNotification([user.FCMtoken], {
        //   emergencyAlertId,
        //   status: "Cancelled",
        // });
        return res.status(200).json({ message: "Emergency alert cancelled" });
      }

      //3 second delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      await Emergency.findByIdAndUpdate(emergencyAlertId, {
        radiusBeingSearched: radius,
      });

      console.log(`Searching within radius: ${radius}`);
      await _sendNotification([user.FCMtoken], {
        emergencyAlertId,
        proximity: radius,
      });

      const nearbyAdmins = getUsersWithinRadius(users, parsedLocation, radius);
      console.log(
        `Found ${nearbyAdmins.length} nearby admins for radius ${radius}`
      );

      if (nearbyAdmins.length > 0) {
        const fcmTokens = nearbyAdmins.map((admin) => admin.FCMtoken);

        await _sendNotification(fcmTokens, {
          title: "Emergency Alert",
          body: "Emergency Alert received, click for more details",
          notificationType: "emergency-alert",
          sender,
          senderLocation: parsedLocation,
          recipient: "admin",
          emergencyAlertId,
        });

        await new Promise((resolve) => setTimeout(resolve, 10000));

        const assignedToAdmin = await checkIfAdminHasBeenAssigned(
          emergencyAlertId
        );
        console.log(`Assigned to admin: ${assignedToAdmin}`);

        if (assignedToAdmin) {
          //This will eventually be removed beacause when an admin is assigned, we will notify the client from the admin side controller
          // await _sendNotification([user.FCMtoken], {
          //   emergencyAlertId,
          //   status: "Assigned",
          // });
          return res
            .status(200)
            .json({ message: "Admin assigned successfully" });
        }
      }
    }

    const finalCancelledCheck = await checkIfCancelled(emergencyAlertId);
    if (finalCancelledCheck) {
      return res.status(200).json({ message: "Emergency alert cancelled" });
    }

    // If no admin was assigned after all proximity ranges
    const allAdminTokens = users.map((admin) => admin.FCMtoken);
    await _sendNotification(allAdminTokens, {
      title: "Emergency Alert",
      body: "Emergency Alert received, click for more details",
      notificationType: "emergency-alert",
      sender,
      senderLocation: parsedLocation,
      recipient: "admin",
      emergencyAlertId,
    });

    //update the value of radiusBeingSearched in the emergency alert to 999 to indicate that all admins have been notified
    await Emergency.findByIdAndUpdate(emergencyAlertId, {
      radiusBeingSearched: 999, //For client message "expanding search radius include everyone"
    });

    //send a notification to the client to notify them that the radius now includes everyone
    await _sendNotification([user.FCMtoken], {
      emergencyAlertId,
      proximity: 999,
    });

    await new Promise((resolve) => setTimeout(resolve, 10000));

    const finalAssignmentCheck = await checkIfAdminHasBeenAssigned(
      emergencyAlertId
    );

    //update the value of assignedTo in the db to "No Admin Assigned" if no admin has been assigned
    if (!finalAssignmentCheck) {
      await Emergency.findByIdAndUpdate(emergencyAlertId, {
        assignedTo: "No Admin Assigned",
      });

      await _sendNotification([user.FCMtoken], {
        emergencyAlertId,
        status: "No Admin Assigned",
      }); //No admin assigned is for the client to know that no admin has been assigned and for it to show the last message "Please be patient"
    }

    return res.status(200).json({ message: "Process completed" });
  } catch (error) {
    console.error("Error in findAndNotifyAdmins:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getEmergencyAlertsByUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.userEmail;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const emergencies = await Emergency.find({ reportedBy: email }).sort({
      createdAt: -1,
    });

    res.status(200).json({ emergencies });
  } catch (error) {
    console.log("Error in getEmergencyAlertsByUser:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getAllEmergencyAlerts = async (req, res) => {
  try {
    // Get current admin that is logged in
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.userEmail;

    const user = await User.findOne({ email });

    // Find all emergency alerts
    const emergencies = await Emergency.find();

    // Define custom order for statuses
    const statusOrder = {
      Searching: 1,
      Assigned: 2,
      Resolved: 3,
      Cancelled: 4,
    };

    // Sort the emergencies by status (custom order) and then by createdAt
    const sortedEmergencies = emergencies
      .map((emergency) => emergency.toObject()) // Convert Mongoose documents to plain objects
      .sort((a, b) => {
        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) {
          return statusDiff; // Sort by status order if different
        }
        return new Date(b.createdAt) - new Date(a.createdAt); // Sort by date if status is the same
      });

    // Add the assignedToCurrentUser flag to each emergency
    sortedEmergencies.forEach((emergency) => {
      if (emergency.status === "Assigned") {
        // Set assignedToCurrentUser to true if the emergency is assigned to the current user
        emergency.assignedToCurrentUser = emergency.assignedTo === email;
      } else {
        // For other statuses, assignedToCurrentUser is false
        emergency.assignedToCurrentUser = false;
      }
    });

    // if the emergency.assignedToCurrentUser is true, and the status is "Assigned", put the emergency at the top of the list
    sortedEmergencies.sort((a, b) => {
      if (a.assignedToCurrentUser && b.assignedToCurrentUser) {
        return 0;
      } else if (a.assignedToCurrentUser) {
        return -1;
      } else if (b.assignedToCurrentUser) {
        return 1;
      }
      return 0;
    });

    // Respond with the updated emergencies array
    res.status(200).json({
      emergencies: sortedEmergencies,
    });
  } catch (error) {
    console.log("Error in getAllEmergencyAlerts:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
// try {
//   const emergencyAlertId = req.params.emergencyAlertId;
//   const assignedTo = "2458487@students.wits.ac.za";

//   const token = req.cookies.token;
//   const decoded = jwt.verify(token, process.env.JWT_SECRET);
//   const sender = decoded.userEmail;
//   const user = await User.findOne({ email: sender });

//   const findAdmindDetails = await User.findOne({ email: assignedTo });

//   _sendNotification([user.FCMtoken], {
//     emergencyAlertId,
//     status: "Assigned",
//     firstName: findAdmindDetails.firstName,
//     lastName: findAdmindDetails.lastName,
//     email: findAdmindDetails.email,
//     phone: findAdmindDetails.phone,
//   });

//   //update the emergency alert with the assignedTo field and its status to "Assigned"
//   await Emergency.findByIdAndUpdate(emergencyAlertId, {
//     assignedTo,
//     status: "Assigned",
//   });

//   res.status(200).json({ message: "Emergency alert assigned successfully" });
// } catch (error) {
//   console.log(error);
//   res.status(500).json({ error: "Error updating emergency alert" });
// }
// };
exports.acceptEmergencyAlert = async (req, res) => {
  try {
    //Get current user(admin)
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.userEmail;

    //Get the emergency alert id
    const emergencyAlertId = req.params.alertId;

    //Check if this emergency alert has been assigned to another admin by checking if status is still Searching
    const emergency = await Emergency.findById(emergencyAlertId);
    if (emergency.status !== "Searching") {
      return res
        .status(400)
        .json({ error: "Emergency alert has already been assigned" });
    }

    //Update the emergency alert with the assignedTo field and its status to "Assigned"
    await Emergency.findByIdAndUpdate(emergencyAlertId, {
      assignedTo: email,
      status: "Assigned",
    });

    //Find user that reported the emergency alert
    const userThatReportedEmergency = await User.findOne({
      email: emergency.reportedBy,
    });

    const findAdminDetails = await User.findOne({ email });

    _sendNotification([userThatReportedEmergency.FCMtoken], {
      emergencyAlertId,
      status: "Assigned",
      firstName: findAdminDetails.firstName,
      lastName: findAdminDetails.lastName,
      email: findAdminDetails.email,
      phone: findAdminDetails.phone,
    });

    return res
      .status(200)
      .json({ message: "Emergency alert assigned successfully" });
  } catch (error) {
    console.log("Error in acceptEmergencyAlert:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.cancelEmergency = async (req, res) => {
  try {
    const emergencyAlertId = req.params.emergencyAlertId;
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.userEmail;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const emergency = await Emergency.findById(emergencyAlertId);

    console.log(emergencyAlertId);

    if (!emergency) {
      return res.status(404).json({ message: "Emergency alert not found" });
    }
    await Emergency.findByIdAndUpdate(emergencyAlertId, {
      status: "Cancelled",
    });

    res.status(200).json({ message: "Emergency alert cancelled successfully" });
  } catch (error) {
    console.log("Error cancelling emergency:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.resolveEmergency = async (req, res) => {
  try {
    const emergencyAlertId = req.params.emergencyAlertId;
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.userEmail;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const emergency = await Emergency.findById(emergencyAlertId);

    if (!emergency) {
      return res.status(404).json({ message: "Emergency alert not found" });
    }

    const userThatReportedEmergency = await User.findOne({ email: emergency.reportedBy });
    

    await Emergency.findByIdAndUpdate(emergencyAlertId, {
      status: "Resolved",
    });

    await _sendNotification([userThatReportedEmergency.FCMtoken], {
      emergencyAlertId,
      status: "Resolved",
    });
    
    res.status(200).json({ message: "Emergency alert resolved successfully" });
  } catch (error) {
    console.log("Error resolving emergency:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.clearEmergencyAlerts = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.userEmail;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await Emergency.deleteMany({ reportedBy: email });

    res.status(200).json({ message: "Emergency alerts cleared successfully" });
  } catch (error) {
    console.log("Error in clearEmergencyAlerts:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};


exports.sendChatMessage = async (req, res) => {
  try {
    const { messageTo, message, emergencyAlertId } = req.body;

    const token = req.cookies.token; // Assuming you're still using cookies
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const role = decoded.role;

    const recipient = await User.findOne({ email: messageTo });

    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // Find chat by emergencyAlertId or create a new one if it doesn't exist
    let chat = await Chat.findOne({ emergencyAlertId });

    if (!chat) {
      chat = new Chat({ emergencyAlertId, messages: [] });
    }

    // Add new message to the chat
    chat.messages.push({
      sender: role === "admin" ? 'admin' : 'user', // Determine if the sender is admin or user
      text: message,
    });

    // Save the updated chat document
    await chat.save();

    // Send the notification (if you have FCM integration)
    await _sendNotification([recipient.FCMtoken], {
      chatMessage: message,
    });

    res.status(200).json({ message: "Chat message sent successfully" });
    
  } catch (error) {
    console.log("Error in sendChatMessage:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

exports.getChatMessages = async (req, res) => {
  try {
    const { emergencyAlertId } = req.params;

    // Find chat by emergencyAlertId
    const chat = await Chat.findOne({ emergencyAlertId });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json({ messages: chat.messages });
  }
  catch (error) {
    console.log("Error in getChatMessages:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
 