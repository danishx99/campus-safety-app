const Emergency = require("../schemas/Emergency");
const User = require("../schemas/User.js");
const notification = require("../schemas/notification");
const jwt = require("jsonwebtoken");

const _sendNotification = require("../utils/sendNotification");

//placeholder logic for the handling the back end of the emergency alert system

exports.tempUpdateEmergency = async (req, res) => {
  try {
    const emergencyAlertId = req.params.emergencyAlertId;
    const assignedTo = "2544233@students.wits.ac.za";

    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const sender = decoded.userEmail;
    const user = await User.findOne({ email: sender });

    _sendNotification([user.FCMtoken], {
      emergencyAlertId,
      status: "Assigned",
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
    res.status(200).json({ emergencyAlert: emergency });
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

// exports.findAndNotifyAdmins = async (req, res) => {

//   //Get the emergency alert ID from the frontend
//   let { emergencyAlertId, location } = req.body;
//   location = JSON.parse(location);

//   //Get the user email from the token
//   const token = req.cookies.token;
//   const decoded = jwt.verify(token, process.env.JWT_SECRET);
//   const sender = decoded.userEmail;

//   //Find the user associated with the emergency alert
//   const user = await User.findOne({ email: sender });

//   //This notifies the frontend(FCM listener) that they can be redirected to the emergency alert since this function may take a while to complete
//   _sendNotification([user.FCMtoken], { emergencyAlertId: emergencyAlertId, redirect: true });

//   //Add 2 second delay
//   await new Promise(resolve => setTimeout(resolve, 3000));

//   let assignedToAdmin = false;
//   let proximities = [0.2, 0.5 ,1, 1.5];

//   //Find all users with the role of admin
//   const users = await User.find({ role: "admin" });

//   //While assignedToAdmin is false, loop through the proximities array and find the admins within the radius(if no admins found within proximity, notify the next proximity),
//   // then notify them, wait 30 seconds(giving them a chance to respond) before finding
//   //out if an admin has been assigned, if one has been assigned, break out of the loop. If one hasnt
//   //been assigned, notify the next set of admins in the next proximity radius. Do tis for all proximities, at the end
//   //if no admin has been assigned, notify all admins
//   // Loop through proximity ranges and notify nearby admins

//   for (let i = 0; i < proximities.length; i++) {
//     const radius = proximities[i];

//     //Update the radius being searched in the emergency alert
//     await Emergency.findByIdAndUpdate(emergencyAlertId, { radiusBeingSearched: radius });

//     const nearbyAdmins = getUsersWithinRadius(users, location, radius);

//     console.log("Nearby admins length: ", nearbyAdmins.length);

//     //log the names of the nearby admins
//     nearbyAdmins.forEach((admin) => {
//       console.log("Admin email: ", admin.email);
//       console.log("Admin name: ", admin.firstName);
//     });

//     console.log("About to send proximity to the client: ", radius);
//     //Send notification to the client to notify them that the proximity has changed
//     _sendNotification([user.FCMtoken], { emergencyAlertId: emergencyAlertId, proximity: radius });

//     console.log("Just notified the client of proximity: ", radius);

//     if(nearbyAdmins.length === 0){
//       console.log("No admins found within proximity: ", radius);
//     }
//     //This if statement runs if there are admins within the current proximity range
//     if (nearbyAdmins.length > 0) {
//       const fcmTokens = nearbyAdmins.map(admin => admin.FCMtoken);

//       // Send notification to admins within the current proximity range
//       await _sendNotification(fcmTokens, {
//         title: "Emergency Alert",
//         body: "Emergency Alert received, click for more details",
//         notificationType: "emergency-alert",
//         sender: sender,
//         senderLocation: location,
//         recipient: "admin",
//         emergencyAlertId: emergencyAlertId,
//       });

//       // Wait for 30 seconds before checking if an admin has been assigned
//       await new Promise(resolve => setTimeout(resolve, 10000));

//       // Check if any admin has been assigned
//       assignedToAdmin = await checkIfAdminHasBeenAssigned(emergencyAlertId);

//       console.log("Assigned to admin: ", assignedToAdmin);

//       // If an admin has been assigned, break out of the loop
//       if (assignedToAdmin) {
//         //Send notification to the client to notify them that admin has been assigned
//       _sendNotification([user.FCMtoken], { emergencyAlertId: emergencyAlertId, status: "Assigned" });
//         break;
//       }

//     }
//   }

//   // If no admin was assigned after all proximity ranges, notify all remaining admins
//   if (!assignedToAdmin) {

//     const allAdminTokens = users.map(admin => admin.FCMtoken);
//     await _sendNotification(allAdminTokens, {
//       title: "Emergency Alert",
//       body: "Emergency Alert received, click for more details",
//       notificationType: "emergency-alert",
//       sender: sender,
//       senderLocation: location,
//       recipient: "admin",
//       emergencyAlertId: emergencyAlertId,
//     });

//     //Wait for 30 seconds
//     await new Promise(resolve => setTimeout(resolve, 10000));

//     //Check if an admin has been assigned
//     assignedToAdmin = await checkIfAdminHasBeenAssigned(emergencyAlertId);

//     console.log("Assigned to admin: ", assignedToAdmin);

//     //If an admin has been assigned, notify the client
//     if (assignedToAdmin) {
//       //Send notification to the client to notify them that admin has been assigned
//       _sendNotification([user.FCMtoken], { emergencyAlertId: emergencyAlertId, status: "Assigned" });
//       //Return the request
//     }else{
//     //If no admin has been assigned, notify the client
//     _sendNotification([user.FCMtoken], { emergencyAlertId: emergencyAlertId, status: "No Admin Assigned" });
//     }

//   }

//   res.status(200).json({ message: "Admins notified successfully" });

//   //Check logic above

// }

exports.findAndNotifyAdmins = async (req, res) => {
  try {
    const { emergencyAlertId, location } = req.body;
    const parsedLocation = JSON.parse(location);

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
    });

    const proximities = [0.2, 0.5, 1, 1.5];
    const users = await User.find({ role: "admin" });

    for (const radius of proximities) {
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
          await _sendNotification([user.FCMtoken], {
            emergencyAlertId,
            status: "Assigned",
          });
          return res
            .status(200)
            .json({ message: "Admin assigned successfully" });
        }
      }
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

    //update the value of radiusBeingSearched in the emergency alert to -1 to indicate that all admins have been notified
    await Emergency.findByIdAndUpdate(emergencyAlertId, {
      radiusBeingSearched: 999,
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
    const status = finalAssignmentCheck ? "Assigned" : "No Admin Assigned";
    await _sendNotification([user.FCMtoken], { emergencyAlertId, status });
    //update the value of assignedTo in the db to "No Admin Assigned" if no admin has been assigned
    if (!finalAssignmentCheck) {
      await Emergency.findByIdAndUpdate(emergencyAlertId, {
        assignedTo: "No Admin Assigned",
      });
    }

    return res.status(200).json({ message: "Process completed", status });
  } catch (error) {
    console.error("Error in findAndNotifyAdmins:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// exports.getPanicStatus = async (req, res) => {
//   try {
//     const token = req.headers.authorization.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findOne({ email: decoded.email });
//     const emergencies = await Emergency.find({ status });
//     res.status(200).json({ emergencies });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Error fetching emergency status" });
//   }
// };
