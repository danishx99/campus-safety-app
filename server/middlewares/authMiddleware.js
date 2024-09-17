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
    console.log("Error authenticating user:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};