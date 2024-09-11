const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const path = require("path");
const User = require("../schemas/User");

// Middleware to check if a user is already logged in
exports.isLoggedIn = (pageType) => {
    return (req, res, next) => {
      try {
        const token = req.cookies.token;
  
        // If the user is already logged in, redirect based on their role
        if (token) {
          const verified = jwt.verify(token, process.env.JWT_SECRET);
          const role = verified.role;
  
          if (role === "student" || role === "staff") {
            return res.redirect("/user");
          } else if (role === "admin") {
            return res.redirect("/admin");
          }
        }
        // If no token is found, proceed to serve the requested page (login or register)
        const page = pageType === "login" ? "login.html" : "register.html";
        return res.sendFile(
          path.join(__dirname, "../../client/html/auth", page)
        );
  
      } catch (error) {
        console.error("Error in isLoggedIn middleware:", error);
        return res.sendFile(
          path.join(__dirname, "../../client/html/auth", "login.html") //redirect to login page if the jwt token is invalid, expired, etc.
        );
      }
    };
  };
  