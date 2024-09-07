const safetyResources= require("../schemas/safetyResources")

// Route to get all safety resources
exports.userSafetyResources = async (req, res) => {
  try {
    // Fetch all safety resources from the database
    const resources = await safetyResources.find({}, 'title type description');
    res.status(200).json({
      message: "Resources fetched successfully",
      data: resources
    });
  } catch (error) {
    console.log("Error fetching safety resources:", error);
    res.status(500).json({ error: "Error fetching safety resources." + error });
  }
};