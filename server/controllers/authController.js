// here we do all our dodgy stuff
const bcrypt = require("bcryptjs"); // For password hashing
const jwt = require("jsonwebtoken"); // For generating JSON Web Tokens
const dotenv = require("dotenv"); // For accessing environment variables
const crypto = require('crypto');
const User= require("../schemas/User")
const Code= require("../schemas/Code")
const mailer = require("../utils/mailingTool"); // Transporter for sending emails
const { log } = require("console");

dotenv.config();

exports.register = async (req,res) =>{

    try {
        
        const {email,account,code, phone,password, firstName, lastName, FCMtoken} = req.body;
        let role;

        console.log("Register endpoint reached");

        if(account==0){
            role="admin";
            //Check if the user has a valid code
            const codeCheck = await Code.findOne({ userCode: code });
            if (!codeCheck) {
              return res.status(400).json({
                error: "Invalid code. Please contact management for further assistance",
              });
            }
            // check that code Check was not made more than 24 hours ago

            if (Date.now() - codeCheck.createdAt > 86400000) {
              return res.status(400).json({ error: "Registration code has expired" });
            }
        }else if( account==1){
            role="student";
        }else if( account==2){
            role="staff";
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
        FCMtoken,
        password: hashedPassword,
        isVerified: false,
        });      

        // Save the new user to the database
        await newUser.save();
        
        //Delete the code because it has been used
        await Code.deleteOne({ userCode: code });

        res.status(201).json({ message: "Registration successful!" });


    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Error registering user" });
    }

};

exports.login = async (req, res) => {
    try {
        console.log("Login endpoint reached");
        
        const { email, password, rememberMe, FCMtoken } = req.body;

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

        // Update the user's FCM token
        user.FCMtoken = FCMtoken;
        await user.save();
        
        res.cookie("token", token, { httpOnly: true, maxAge });

        // Return success
        res.json({ success: true, redirect: user.role });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ error: "Error logging in user" });
    }
};

exports.googleRegister= async (req,res) =>{

  const{name,surname,email,phone,account}=req.body;

  try {

    let role;

    console.log("Register with Google endpoint reached");

    if(account==0){
        role="admin";
    }else if( account==1){
        role="student";
    }else if( account==2){
        role="staff";
    }

    // check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
    return res
        .status(400)
        .json({ error: "A user with this email address already exists." });
    }

    // Create a new user
    const newUser = new User({
      firstName:name,
      lastName:surname,
      email,
      phone,
      role,
      // FCMtoken,
      isVerified: true,
      });      

      // Save the new user to the database
      await newUser.save();

      res.status(201).json({ message: "Registration successful!" });
    
  } catch (error) {
    console.error("Error registering user with Google :", error);
    res.status(500).json({ error: "Error registering user with Google" });    
  }

};

exports.googleLogin= async (req,res) =>{

  const {email}= req.body;

  try {
    
    // find user by email
    const user = await User.findOne({ email });
    if (!user) {
        return res
            .status(401)
            .json({ error: "A user with this email address does not exist." });
    }

    // Use rememberMe to set different token expiration times
    let rememberMe =false;
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
    console.error("Error logging in using Google", error);
    res.status(500).json({ error: "Error logging in using Google" });
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

exports.isVerified = async (req,res) =>{

  const token = req.cookies.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const email = decoded.userEmail;


  try {

    // find user by email
    const user = await User.findOne({ email });

    if (!user) {
        return res
            .status(401)
            .json({ error: "A user with this email address does not exist." });
    }



    
  } catch (error) {

    console.error("Error checking user verification status :", error);

  }
};

// send verification email
exports.sendVerification= async (req,res)=>{

  const token = req.cookies.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const email = decoded.userEmail;

  try {

    // find user by email
    const user = await User.findOne({ email });
    if (!user) {
        return res
            .status(401)
            .json({ error: "A user with this email address does not exist." });
    }

    // Generate a unique verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    // newUser.verificationTokenExpires = Date.now() + 2 * 60 * 1000; // 2 minutes expiry
    user.verificationTokenExpires = Date.now() + 3600000; // 1 hour expiry

    user.save(); // save new tokens to user

    // send verification email
    var url = req.protocol + "://" + req.get("host");
    await mailer.sendVerificationEmail(email,url,verificationToken);

    console.log("Verification Email Successfully Sent!");
    res.json({message:"Verification Email Successfully Sent!"});

    
  } catch (error) {
    console.error("Error sending verification email :", error);
  }
};

// change this to accomodate new logic
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
        

        res.status(200).json({ 
          message: 'Email verified successfully!',
          redirect: user.role // Include the user's role for redirection
      });
    } catch (error) {
        res.status(500).json({ error: 'Error verifying email', error });
    }

};

// Resend verification email (if token expires or email was missed)
exports.resendVerificationEmail = async (req, res) => {

    const {email}=req.body;
  
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

      console.log(`Verification email sent succesfully to ${email}`);
      
    } catch (error) {
      res.status(500).json({ message: 'Error resending verification email', error });
    }
  };
  
exports.logout = async (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).redirect("/login");
    } catch (error) {
        console.error("Error logging out user:", error);
        res.status(500).json({ error: "Error logging out user" });
    }
};

exports.checkEmailVerification = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.userEmail;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ isVerified: user.isVerified });
  } catch (error) {
    console.error("Error checking email verification status:", error);
    res.status(500).json({ error: "Error checking email verification status" });
  }
};

exports.generateCode = async (req, res) => {
  try {
  
    console.log("Generate code endpoint reached");
    //Generate a random 5 digit code and prefix it with the role
    const code = Math.floor(10000 + Math.random() * 90000);

    //const codeCheck = await Code.findOne({ userCode: code });
    while((await Code.findOne({ userCode: code }))){
        code = Math.floor(10000 + Math.random() * 90000);
    }
            

    console.log("Generated code: ", code);

    //Store code along with role in the database

    const newCode = new Code({
      userCode: code,
    });

    await newCode.save();

    res.json({ message: code });
  } catch (error) { 
    console.log("Error generating code:", error);
    res.status(500).json({ error: "Error generating code" });
  }
};