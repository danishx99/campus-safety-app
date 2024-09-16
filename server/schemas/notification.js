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
            enum: ['incidentUpdate', 'announcement','emergency-alert','incidentReport','message']
        },

        senderLocation: {
            type: String,
            required: false,
        }

    },
    {
        timestamps: true 
    
    }

);

module.exports = mongoose.model("notification", notificationSchema);