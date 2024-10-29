const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: false, // no password for google sign in
    },
    phone: {
      type: String,
      required: false, // what if no phone number associated with student google acc
    },
    FCMtoken: {
      type: String,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "staff", "student"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    }, // Email verification status
    verificationToken: {
      type: String,
    }, // Token to verify email
    verificationTokenExpires: {
      type: Date,
    }, // Expiration time for the token
    profilePicture: {
      type: String,
      default:
        "data:image/png;base64,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",
    },

    lastLocation: {
      // [lat, long]
      type: String,
      required: false,
    },
  },
  {
    timestamps: true, // This will automatically add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("User", userSchema);
