const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const User = require('../schemas/User');
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


    if(role == "student"){
    return res.redirect("/userDashboard");  
    } else if(role == "staff"){
    return res.redirect("/userDashboard");
    } else if(role == "admin"){
    return res.redirect("/admindashboard");
    }

  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(401).json({error: "Invalid token"});
  }

};
