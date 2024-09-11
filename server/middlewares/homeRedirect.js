const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

exports.homeRedirect = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect("/login");
    }
    
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    let role = verified.role;

    if (role === "admin") {
      return res.redirect("/admin");  
    } else {
      return res.redirect("/user");
    }
    
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(401).json({error: "Invalid token"});
  }
};