const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

exports.authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/login");
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userEmail = decoded.userEmail;
    req.role = decoded.role;

    next();
  } catch (error) {
    console.error("Error authenticating user:", error);
    return res.redirect("/login"); //redirect to login page if the jwt token is invalid, expired, etc.
  }
};