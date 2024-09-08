// here we do all our dodgy stuff
const bcrypt = require("bcryptjs"); // For password hashing
const jwt = require("jsonwebtoken"); // For generating JSON Web Tokens
const dotenv = require("dotenv"); // For accessing environment variables
const safetyResources= require("../schemas/safetyResources")

exports.adminSafetyResources = async (req,res) =>{
    try{
        const {
            title,
            type,
            description,
          } = req.body;
        const newResource = new safetyResources ({
            title,
            type,
            description,
        });
        await newResource.save();
        res.status(201).json({ message: "Resource added successfully" });
    }
    catch (error){
        console.log("Error adding safety resource:", error);
        res.status(500).json({ error: "Error adding safety resource." + error });
    }
};

exports.deleteAllSafetyResources = async (req, res) => {
    try {
      // Remove all documents from the safetyResources collection
      await safetyResources.deleteMany({});
      res.status(200).json({ message: "All safety resources have been deleted." });
    } catch (error) {
      console.log("Error deleting safety resources:", error);
      res.status(500).json({ error: "Error deleting safety resources." + error });
    }
  };