const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const path = require("path");
const User = require("../schemas/User");

// Check if the user is an admin
exports.isUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect("/login");
    }

        

    const verified = jwt.verify(token, process.env.JWT_SECRET);

    let userEmail = verified.userEmail;
    let role = verified.role;

    if (role !== "student" && role !== "staff") {
      //return status 403 and send html file
      return res
        .status(403).json({
            error: "You are not authorized to access this resource (not a student or staff member). This page will probs be replaced with a dedicated page for this error",
    });
    }

    next();
    //res.status(401).json({message: "You are authorized to access this resource, your details are: " + verified.userId + " " + verified.role});
  } catch (error) {
    console.error("Error authenticating user:", error);
    return res.redirect("/login"); //redirect to login page if the jwt token is invalid, expired, etc.
    
  }
};
