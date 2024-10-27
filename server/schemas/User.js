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
        "UklGRrACAABXRUJQVlA4WAoAAAAQAAAAHQAAHgAAQUxQSMYAAAABgGPb2rHnrr90JmC0TnrbSW+0Rscp2E5qDcBOSvNNaZufv+95ZhAREwDzS9LXerk3aD2ND5JWBFNEDz1IxsN+VrzaJYv9fqZiryTLIsFEwadE+FtokC0R5+r4CapLP82URD4PIF9ijAHmOObhJ3H+exWwSBW9PL3zPAsHPOeC52yHZ2GcZ7qKpzKcJwSLHIdAE0cR4BF0wgYghi4F2jaqFuh303TBuIWiBWaLLqzcZMG8u0aYeWjxgvWM/s13SXre7UqwwxhWUDggxAEAAHAJAJ0BKh4AHwA+bS6SRaQioZgEAEAGxLYATplCOBvVfxA5M/bYxNhAbYDzAbjp1IG8W/tx6LRM5JAdvVMFV6bhGp219kwCy2eiu+12yOlqAn5CJAD+r3UEqZFf0Ym6CzcBmRTwbuTj5uagmd1v4x+H84D/dyfxxwVjZN5zT79eURUo5F9pxqC6zSbowsibjDSqHtwG2EdaPxj5Vl7gHq/l38Of2o75vU+rmYZl079ttpQ//z3/+o/jHxxF4ZP9vnZlMA44m2DP3YGcSpfg/warHhChxO1PDydKLrZY4u2it0TRhDbBkeT4IZhb9UGe8IJPBCVjXGKlc/Tudo+eepH6/IftQodFt+2ApwoOYBGkRy/70PX/V+NdUfTpLckqAY9Vdjv9WR7xX3zeLY4aLH0ZfnjCm7mvDU0wAvsyvAJyFZ8yyvf7Chs2KecCyfNp1wlqEeCWHGi+edu8USDZMYRdh0uaWesjxmkC4z8TY9N2s0p8v/xOBUyTl/yLh5XfbIXkbM+QbooWL+FMJN4uJ2Xz6UlEb3QFEeskQrQf2kyfykw34MNwlzUa5u4T4DnXkaDLnndC46CTb/e8BqitRqSKAAAA",
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
