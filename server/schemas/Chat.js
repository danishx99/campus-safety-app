const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'admin'], // Can only be 'user' or 'admin'
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // To keep track of the time each message was sent
});

const chatSchema = new mongoose.Schema({
  emergencyAlertId: {
    type: String,
    required: true,
  },
  messages: [messageSchema], // Array of messages following the structure above
}, {
  timestamps: true,
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
