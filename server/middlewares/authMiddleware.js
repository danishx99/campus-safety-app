const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

exports.verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      error: "You are not authorized to access this resource (Not logged in)",
    });
  }


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userCode = decoded.userCode;
    req.role = decoded.role;
    next();
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};