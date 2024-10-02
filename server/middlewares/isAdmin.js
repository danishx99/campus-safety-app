const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const path = require("path");
const User = require("../schemas/User");

// Check if the user is an admin
exports.isAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.redirect("/login");
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);

    let userEmail = verified.userEmail;
    let role = verified.role;

    if (role !== "admin") {
      //return status 403 and send html file
      return res
        .status(403)
        .sendFile(
          path.join(__dirname, "../../client/html/error/authorisation.html")
        );
    }

    next();
    //res.status(401).json({message: "You are authorized to access this resource, your details are: " + verified.userId + " " + verified.role});
  } catch (error) {
    console.log("Error authenticating user:", error);
    return res.redirect("/login"); //redirect to login page if the jwt token is invalid, expired, etc.
  }
};
