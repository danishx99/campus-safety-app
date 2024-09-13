
const notification = require("../schemas/notification");
const User = require("../schemas/User");

const _sendNotification = require("../utils/sendNotification");

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
            senderLocation: req.body.senderLocation// [latitude, longitude]
        });

        const fcmTokens = [];

        const savedNotification = await newNotification.save();

        if(recepient === 'everyone') {
            // Get all FCM tokens
            const users = await User.find({});
            fcmTokens = users.map(user => user.FCMtoken);
        }else if(recepient === 'staff') {
            // Get all staff FCM tokens
            const users = await User.find({role: 'staff'});
            fcmTokens = users.map(user => user.FCMtoken);
        } else if(recepient === 'student') {
            // Get all student FCM tokens
            const users = await User.find({role: 'student'});
            fcmTokens = users.map(user => user.FCMtoken);
        } else if(recepient === 'specific') {
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

