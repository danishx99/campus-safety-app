const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
 
  firstName: {
    type: String,
    required: false
  },
  lastName: {
    type: String,
    required: false
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
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt timestamps
});

module.exports = mongoose.model('User', userSchema);
