const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
    {
        recipient: {
             type: String, //[everyone, staff, student, specific]
             required: true,   
        },
        sender: {
            type: String, //[specific]
            required: true,
        },
        read: {
            type: Boolean,
            default: false,
        },
        message: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        notificationType: {
            type: String,
            required: true,
            enum: ['Incident update', 'announcement','emergency-alert','Incident reported','Incident message']
        },

        senderLocation: { type: [Number], required: false } // Array of numbers

    },
    {
        timestamps: true 
    
    }

);

module.exports = mongoose.model("notification", notificationSchema);
