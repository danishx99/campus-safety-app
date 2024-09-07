const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'staff', 'student'] 
  },
  isVerified: {
    type: Boolean,
    default: false
   }, // Email verification status
  	verificationToken: {
      type: String
   }, // Token to verify email
  	verificationTokenExpires: {
      type: Date
   }, // Expiration time for the token
  profilePicture: {
    type: String,
    default: '../assets/user-profile.png'
  }
}, {
  timestamps: true // This will automatically add createdAt and updatedAt fields
});

module.exports = mongoose.model('User', userSchema);
