const notification = require("../schemas/notification");
const User = require("../schemas/User");
const jwt = require("jsonwebtoken");

const { sendIncidentUpdateEmail } = require("../utils/mailingTool");

const _sendNotification = require("../utils/sendNotification");
const Incident = require("../schemas/Incident");
exports.getNotificationHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Find all notifications from admin users, sorted by createdAt in descending order
    const adminNotifications = await notification.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "email",
          as: "senderInfo",
        },
      },
      {
        $match: {
          "senderInfo.role": "admin",
        },
      },
      {
        $project: {
          senderInfo: 0,
        },
      },
      {
        $sort: { createdAt: -1 }, // Sort by createdAt in descending order
      },
    ]);

    // Calculate total pages
    const totalNotifications = adminNotifications.length;
    const totalPages = Math.ceil(totalNotifications / limitNum);

    // Apply pagination
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedNotifications = adminNotifications.slice(
      startIndex,
      endIndex
    );

    res.status(200).json({
      notifications: paginatedNotifications,
      totalPages: totalPages,
      currentPage: pageNum,
      totalNotifications: totalNotifications,
    });
  } catch (error) {
    console.log("Error getting notification history:", error);
    res.status(500).json({ error: "Error getting notification history." });
  }
};

/*

Method to find locations within certain radius of a location

 
        //Get all the locations, exlude the user with the email address
        const locations = await Location.find({email: {$ne: email}});
        
        console.log("All the locations that were found: ", locations);

        // Filter the locations to get the nearby locations using the Haversine formula
        const nearbyLocations = locations.filter((loc) => {
            const R = 6371; // Radius of the earth in km
            const [userLon, userLat] = userLocation;
            const [locLon, locLat] = loc.location;
            
            const dLat = deg2rad(locLat - userLat);
            const dLon = deg2rad(locLon - userLon);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(userLat)) * Math.cos(deg2rad(locLat)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const d = R * c; // Distance in km
            return d <= 20; // Return locations within 5km radius
        });

*/

exports.sendNotification = async (req, res) => {
  try {
    //Find the sender by decoding the jwt cookie token
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const sender = decoded.userEmail;

    const newNotification = new notification({
      recipient: req.body.recipient,
      sender: sender,
      read: false,
      message: req.body.message,
      title: req.body.title,
      notificationType: req.body.notificationType,
      senderLocation: req.body.senderLocation, // [latitude, longitude]
      //targetLocation: req.body.targetLocation,(view on map when shown in notifications)
    });

    console.log("the recpient is ", req.body.recipient);

    let recipient = req.body.recipient;

    //check if the recipient exists as a user

    let users;

    let fcmTokens = [];

    const savedNotification = await newNotification.save();

    if (recipient === "everyone") {
      // Get all FCM tokens , exlcuding admins
      users = await User.find({ role: { $ne: "admin" } });
      fcmTokens = users.map((user) => user.FCMtoken);
    } else if (recipient === "staff") {
      // Get all staff FCM tokens
      users = await User.find({ role: "staff" });
      fcmTokens = users.map((user) => user.FCMtoken);
    } else if (recipient === "student") {
      // Get all student FCM tokens
      users = await User.find({ role: "student" });
      fcmTokens = users.map((user) => user.FCMtoken);
    } else if (recipient === "admin") {
      // Get specific user FCM token
      users = await User.find({ role: "admin" });
      fcmTokens = users.map((user) => user.FCMtoken);
    } else {
      // Get specific user FCM token
      users = await User.findOne({ email: recipient });
      if (!users) {
        //The user belongs to some external group, send an email instead to the user
        //Get the incident from the users email address to extract user firstName and lastName
        const incident = await Incident.findOne({ reportedBy: recipient });
        if (!incident) {
          console.log("this was");
          return res.status(400).json({
            error: "User does not exist and no incident was found.",
          });
        }

        const firstName = incident.firstName;
        const lastName = incident.lastName;

        await sendIncidentUpdateEmail(
          req.body.title,
          req.body.message,
          recipient,
          firstName,
          lastName
        );
        return res
          .status(200)
          .json({ message: "User successfully notified via email" });
      }
      fcmTokens = [users.FCMtoken];
    }

    let targetLocation = req.body.targetLocation;
    let radius = req.body.radius;

    console.log("radius", radius);

    console.log("targetLocation", targetLocation);

    function deg2rad(deg) {
      return deg * (Math.PI / 180);
    }

    if (targetLocation && radius) {
      console.log("Because target location is non null, this line got called");

      //Change targetLocation to array
      targetLocation = JSON.parse(targetLocation);

      //Filter through the users and send notification to those within 5km of the target location
      const nearbyUsers = users.filter((user) => {
        if (user.lastLocation) {
          const R = 6371; // Radius of the earth in km
          const [targetLon, targetLat] = [targetLocation[1], targetLocation[0]];
          const [userLon, userLat] = [
            JSON.parse(user.lastLocation)[1],
            JSON.parse(user.lastLocation)[0],
          ];

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
          return d <= radius / 1000; // Return locations within certain radius(in km)
        }
      });

      console.log("nearbyUsers", nearbyUsers);

      //Overwrite fcmTokens with the nearbyUsers FCM tokens
      fcmTokens = nearbyUsers.map((user) => user.FCMtoken);
    }

    if (fcmTokens.length === 0) {
      return res
        .status(200)
        .json({ message: "Notification sent successfully" });
    }

    console.log("title" + savedNotification.title);
    console.log("message" + savedNotification.message);

    //Send notification
    await _sendNotification(fcmTokens, {
      title: savedNotification.title,
      body: savedNotification.message,
      notificationType: savedNotification.notificationType,
      sender: savedNotification.sender,
      senderLocation: savedNotification.senderLocation,
      recipient: savedNotification.recipient,
      url: "/user/viewNotifications",
    });

    //Console log the names of all the users it

    res.status(200).json({ message: "Notification sent successfully" });
  } catch (error) {
    console.log("Error sending notification:", error);
    res.status(500).json({ error: "Error sending notification." + error });
  }
};
exports.getUnreadNotifications = async (req, res) => {
  try {
    const userEmail = req.userEmail;
    const role = req.role;

    let notifications;

    if (role === "admin") {
      // Find unread notifications where the recipient is 'admin', sorted by newest first
      notifications = await notification
        .find({ recipient: "admin", read: false })
        .sort({ createdAt: -1 }) // Sort by createdAt in descending order
        .limit(5); // Limit the number of documents returned
    } else if (role === "staff") {
      // Find unread notifications where recipient is 'everyone', 'staff', or the specific user, sorted by newest first
      notifications = await notification
        .find({
          $or: [
            { recipient: "everyone" },
            { recipient: "staff" },
            { recipient: userEmail },
          ],
          read: false,
        })
        .sort({ createdAt: -1 })
        .limit(5);
    } else {
      // Find unread notifications where recipient is 'everyone', 'student', or the specific user, sorted by newest first
      notifications = await notification
        .find({
          $or: [
            { recipient: "everyone" },
            { recipient: "student" },
            { recipient: userEmail },
          ],
          read: false,
        })
        .sort({ createdAt: -1 })
        .limit(5);
    }

    // Send the sorted notifications
    res.status(200).json({ notifications: notifications });
  } catch (error) {
    console.log("Error getting unread notifications:", error);
    res.status(500).json({ error: "Error getting unread notifications." });
  }
};
exports.getAllNotifications = async (req, res) => {
  try {
    const userEmail = req.userEmail;
    const role = req.role;

    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Default to 10 notifications per page
    const skip = (page - 1) * limit; // Calculate how many documents to skip

    let notificationsQuery;

    if (role === "admin") {
      notificationsQuery = { recipient: "admin" };
    } else if (role === "staff") {
      notificationsQuery = {
        $or: [
          { recipient: "everyone" },
          { recipient: "staff" },
          { recipient: userEmail },
        ],
      };
    } else {
      notificationsQuery = {
        $or: [
          { recipient: "everyone" },
          { recipient: "student" },
          { recipient: userEmail },
        ],
      };
    }

    // Find total notifications count for pagination
    const totalNotifications = await notification.countDocuments(
      notificationsQuery
    );

    //Mark all notifications as read
    await notification.updateMany(notificationsQuery, { read: true });

    // Find notifications for the current page
    const notifications = await notification
      .find(notificationsQuery)
      .sort({ createdAt: -1 })
      .skip(skip) // Skip the appropriate number of documents
      .limit(limit); // Limit the number of documents returned

    const totalPages = Math.ceil(totalNotifications / limit); // Calculate total pages

    // Send paginated response
    res.status(200).json({
      notifications,
      currentPage: page,
      totalPages,
      totalNotifications,
    });
  } catch (error) {
    console.log("Error getting all notifications:", error);
    res.status(500).json({ error: "Error getting all notifications." });
  }
};

//Route to redirect user based on role to correct notification page, extract token, find role, and redirect
exports.redirectToNotificationPage = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const role = decoded.role;

    if (role === "admin") {
      res.redirect("/admin/viewNotifications");
    } else {
      res.redirect("/user/viewNotifications");
    }
  } catch (error) {
    console.log("Error redirecting to notification page:", error);
    res.status(500).json({ error: "Error redirecting to notification page." });
  }
};
