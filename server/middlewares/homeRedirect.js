const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const User = require("../schemas/User");
// Check if the user is an admin

exports.homeRedirect = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect("/login");
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);

    let userEmail = verified.userEmail;
    let role = verified.role;

    if (role == "student") {
      return res.redirect("/user");
    } else if (role == "staff") {
      return res.redirect("/user");
    } else if (role == "admin") {
      return res.redirect("/admin");
    }
  } catch (error) {
    console.log("Error authenticating user:", error);
    return res.redirect("/login"); //redirect to login page if the jwt token is invalid, expired, etc.
  }
};
