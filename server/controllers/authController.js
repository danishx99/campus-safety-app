// here we do all our dodgy stuff
const bcrypt = require("bcryptjs"); // For password hashing
const jwt = require("jsonwebtoken"); // For generating JSON Web Tokens
const dotenv = require("dotenv"); // For accessing environment variables
const User= require("../schemas/User")

exports.register = async (req,res) =>{

    try {
        
        const {email,account,phone,password } = req.body;
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
        email,
        phone,
        role,
        password: hashedPassword,
        });

        // Save the new user to the database
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });


    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ error: "Error logging in user" });
    }

};