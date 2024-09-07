// here we do all our dodgy stuff
const bcrypt = require("bcryptjs"); // For password hashing
const jwt = require("jsonwebtoken"); // For generating JSON Web Tokens
const dotenv = require("dotenv"); // For accessing environment variables
const crypto = require('crypto');
const User= require("../schemas/User")
const mailer = require("../utils/mailingTool"); // Transporter for sending emails
const { log } = require("console");

dotenv.config();

exports.register = async (req,res) =>{

    try {
        
        const {email,account,phone,password, firstName, lastName} = req.body;
        let role;

        console.log("Register endpoint reached");

        if(account==0){
            role="admin";
        }else if( account==1){
            role="staff";
        }else if( account==2){
            role="student";
        }
        

        // check if user already exists
        const existing = await User.findOne({ email });
        if (existing) {
        return res
            .status(400)
            .json({ error: "A user with this email address already exists." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
        firstName,
        lastName,
        email,
        phone,
        role,
        password: hashedPassword,
        isVerified: false,
        });

        // Generate a unique verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        newUser.verificationToken = verificationToken;
        newUser.verificationTokenExpires = Date.now() + 3600000; // 1 hour expiry

        // Save the new user to the database
        await newUser.save();

        // send verification email
        var url = req.protocol + "://" + req.get("host");
        await mailer.sendVerificationEmail(email,url,verificationToken);

        res.status(201).json({ message: "Registration successful! Please verify your email." });


    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ error: "Error logging in user" });
    }

};

exports.login = async (req, res) => {
    try {
        console.log("Login endpoint reached");
        
        const { email, password, rememberMe } = req.body;

        // find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(401)
                .json({ error: "A user with this email address does not exist." });
        }

        // check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Use rememberMe to set different token expiration times
        const tokenExpiration = rememberMe ? "7d" : "24h"; // 7 days or 24 hours

        // sign JWT with email and role
        const token = jwt.sign(
            { userEmail: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: tokenExpiration } // Adjust expiration based on rememberMe
        );

        // Set token as an HttpOnly cookie
        const maxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 7 days or 24 hours
        res.cookie("token", token, { httpOnly: true, maxAge });

        // Return success
        res.json({ success: true, redirect: user.role });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ error: "Error logging in user" });
    }
};


exports.resetPassword = async (req,res) =>{

    try {
        const { resetToken, password } = req.body;
        // Check if token is provided
        if (!resetToken) {
            return res.status(400).json({ error: "Token must be provided" });
        }
    
        // console.log("Reset token : " + resetToken);
    
        // Verify the reset token
        const decoded = jwt.verify(resetToken, process.env.RESET_JWT_SECRET);
    
        if (!decoded) {
          return res.status(401).json({ error: "Invalid reset token" });
        }
    
        // Find the user by email
        const user = await User.findOne({ email: decoded.userEmail });
    
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
    
        // Update the user's password
        user.password = await bcrypt.hash(password, 10);
        await user.save();
    
        // Send the password reset email
        await mailer.sendSuccess(user.email);
    
        console.log(
          `Email confirming password reset sent to ${user.email}`
        );
    
        res.json({ message: "Password reset successfully" });
    

      } catch (error) {
        console.log("Error resetting password:", error);
        res.status(500).json({ error: "Error resetting password" });
      }


};

exports.forgotPassword = async (req,res) =>{

    try {
        const { email } = req.body;
    
        // Find the user by email
        const user = await User.findOne({ email });
    
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
    
        // Generate a token for password reset
        const resetToken = jwt.sign(
          {userEmail: user.email, role: user.role },
          process.env.RESET_JWT_SECRET,
          { expiresIn: "1h" }
        );

        var url = req.protocol + "://" + req.get("host");
        // console.log(url);

        // Send the reset token via email
        await mailer.sendRequest(user.email,url,resetToken);

        res.status(200).json({ message: "Password reset instructions have been sent to your email." });
    
        console.log(
          `Email to reset password sent to ${user.email}`
        );

      } catch (error) {
        console.error("Error initiating password reset:", error);
        res.status(500).json({ error: "Error initiating password reset" });
      }

};

exports.verifyEmail = async (req,res) =>{

    const { token } = req.body;
    // console.log("Token is: ",token);
    

    try {
        // Find user with the corresponding verification token
        const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: Date.now() }, // Check token expiration
        });

        if (!user) {
        return res.status(400).json({ error: 'Invalid or expired token' });
        }

        // Mark email as verified
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;

        await user.save();
        console.log("Email verified succesfully");
        

        res.status(200).json({ message: 'Email verified successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Error verifying email', error });
    }

};

// Resend verification email (if token expires or email was missed)
exports.resendVerificationEmail = async (req, res) => {

    //decode jwt to get user email, then use that to search
  
    try {

      const user = await User.findOne({ email });
      if (!user || user.isVerified) {
        return res.status(400).json({ message: "User doesn't exist or is already verified" });
      }
  
      // Generate a new verification token
      const newVerificationToken = crypto.randomBytes(32).toString('hex');
      user.verificationToken = newVerificationToken;
      user.verificationTokenExpires = Date.now() + 3600000; // 1 hour from now
  
      await user.save();
  
      // Send new verification email
      var url = req.protocol + "://" + req.get("host");
    //   const verifyUrl = `${url}/verifyEmail?token=${newVerificationToken}`;
  
      // Send the new token via email
      await mailer.resendVerificationEmail(user.email,url,newVerificationToken);
  
      res.status(200).json({ message: 'Verification email resent successfully!' });
    } catch (error) {
      res.status(500).json({ message: 'Error resending verification email', error });
    }
  };
  