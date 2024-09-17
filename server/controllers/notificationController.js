
const notification = require("../schemas/notification");
const User = require("../schemas/User");
const jwt = require("jsonwebtoken");

const _sendNotification = require("../utils/sendNotification");
exports.getNotificationHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        // Find all notifications from admin users, sorted by createdAt in descending order
        const adminNotifications = await notification.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'sender',
                    foreignField: 'email',
                    as: 'senderInfo'
                }
            },
            {
                $match: {
                    'senderInfo.role': 'admin'
                }
            },
            {
                $project: {
                    senderInfo: 0
                }
            },
            {
                $sort: { createdAt: -1 } // Sort by createdAt in descending order
            }
        ]);

        // Calculate total pages
        const totalNotifications = adminNotifications.length;
        const totalPages = Math.ceil(totalNotifications / limitNum);

        // Apply pagination
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const paginatedNotifications = adminNotifications.slice(startIndex, endIndex);

        res.status(200).json({
            notifications: paginatedNotifications,
            totalPages: totalPages,
            currentPage: pageNum,
            totalNotifications: totalNotifications
        });

    } catch (error) {
        console.log("Error getting notification history:", error);
        res.status(500).json({ error: "Error getting notification history." });
    }
};

exports.sendNotification = async (req, res) => {
    try {

        //Find the sender by decoding the jwt cookie token
        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const sender = decoded.userEmail;

        console.log("re",req.body.recipient)

        
        const newNotification = new notification({
            recipient: req.body.recipient,
            sender: sender,
            read: false,
            message: req.body.message,
            title: req.body.title,
            notificationType: req.body.notificationType,
            senderLocation: req.body.senderLocation// [latitude, longitude]
        });

        let recipient = req.body.recipient;

        let fcmTokens = [];

        const savedNotification = await newNotification.save();

        if(recipient === 'everyone') {
            // Get all FCM tokens , exlcuding admins
            const users = await User.find({});
            fcmTokens = users.map(user => user.FCMtoken);
        }else if(recipient === 'staff') {
            // Get all staff FCM tokens
            const users = await User.find({role: 'staff'});
            fcmTokens = users.map(user => user.FCMtoken);
        } else if(recipient === 'student') {
            // Get all student FCM tokens
            const users = await User.find({role: 'student'});
            fcmTokens = users.map(user => user.FCMtoken);
        } else if(recipient === 'specific') {
            // Get specific user FCM token
            const users = await User.find({email: req.body.recipient});
            fcmTokens = users.map(user => user.FCMtoken);
        }

        if(fcmTokens.length === 0) {
            return res.status(200).send('No users found');
        }

        //Send notification
        await _sendNotification(fcmTokens, savedNotification.title, savedNotification.message, { notificationType: savedNotification.notificationType, sender: savedNotification.sender, senderLocation: savedNotification.senderLocation });

        res.status(200).json({ message: "Notification sent successfully" });
    } catch (error) {
        console.log("Error sending notification:", error);
        res.status(500).json({ error: "Error sending notification." + error });
    }
}
exports.getUnreadNotifications = async (req, res) => {
    try {
        const userEmail = req.userEmail;
        const role = req.role;

        let notifications;

        if (role === 'admin') {
            // Find unread notifications where the recipient is 'admin', sorted by newest first
            notifications = await notification.find({ recipient: "admin", read: false })
                .sort({ createdAt: -1 }); // Sort by createdAt in descending order
        } else if (role === 'staff') {
            // Find unread notifications where recipient is 'everyone', 'staff', or the specific user, sorted by newest first
            notifications = await notification.find({ 
                $or: [{ recipient: "everyone" }, { recipient: "staff" }, { recipient: userEmail }],
                read: false 
            }).sort({ createdAt: -1 });
        } else {
            // Find unread notifications where recipient is 'everyone', 'student', or the specific user, sorted by newest first
            notifications = await notification.find({ 
                $or: [{ recipient: "everyone" }, { recipient: "student" }, { recipient: userEmail }],
                read: false 
            }).sort({ createdAt: -1 });
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

        if (role === 'admin') {
            notificationsQuery = { recipient: "admin" };
        } else if (role === 'staff') {
            notificationsQuery = {
                $or: [{ recipient: "everyone" }, { recipient: "staff" }, { recipient: userEmail }]
            };
        } else {
            notificationsQuery = {
                $or: [{ recipient: "everyone" }, { recipient: "student" }, { recipient: userEmail }]
            };
        }

        // Find total notifications count for pagination
        const totalNotifications = await notification.countDocuments(notificationsQuery);

        //Mark all notifications as read
        await notification.updateMany(notificationsQuery, { read: true });


        // Find notifications for the current page
        const notifications = await notification.find(notificationsQuery)
            .sort({ createdAt: -1 })
            .skip(skip) // Skip the appropriate number of documents
            .limit(limit); // Limit the number of documents returned

        const totalPages = Math.ceil(totalNotifications / limit); // Calculate total pages

        // Send paginated response
        res.status(200).json({
            notifications,
            currentPage: page,
            totalPages,
            totalNotifications
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
        const role = decoded.userRole;

        if (role === 'admin') {
            res.redirect('/admin/viewNotifications');
        } else {
            res.redirect('/user/viewNotifications');
        }

    } catch (error) {
        console.log("Error redirecting to notification page:", error);
        res.status(500).json({ error: "Error redirecting to notification page." });
    }
};

