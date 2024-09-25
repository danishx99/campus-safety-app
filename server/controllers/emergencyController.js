const Emergency = require("../schemas/Emergency");
const User = require("../schemas/User.js");
const notification = require("../schemas/notification"); 
const jwt = require("jsonwebtoken");

const _sendNotification = require("../utils/sendNotification");


//placeholder logic for the handling the back end of the emergency alert system

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
        });
        await newEmergency.save();

        const newNotification = new notification({
            recipient: "admin",
            sender: email,
            read: false,
            message: "Emergency Alert received from "+ email,
            title: "Emergency Alert",
            notificationType: "emergency-alert",
          });

        await newNotification.save();

        const users = await User.find({role: 'admin'});
        fcmTokens = users.map(user => user.FCMtoken);

         //Send notification
         await _sendNotification(fcmTokens, "Emergency Alert", "", { notificationType: "emergency-alert", sender: email, senderLocation: location, recipient: "admin"});

        res.status(200).json({
        message: "Emergency alert sent successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error sending emergency alert" });
    }   
};

exports.getPanicStatus = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });
        const emergencies = await Emergency.find({ status });
        res.status(200).json({  emergencies });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error fetching emergency status" });
    }

}
