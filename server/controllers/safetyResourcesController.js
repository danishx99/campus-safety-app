const safetyResources = require("../schemas/safetyResources");
const ObjectId = require("mongodb").ObjectId;

exports.adminSafetyResources = async (req, res) => {
  try {
    const { title, type, description, link } = req.body;
    const newResource = new safetyResources({
      title,
      type,
      description,
      link,
    });
    await newResource.save();
    res.status(201).json({ message: "Resource added successfully" });
  } catch (error) {
    console.log("Error adding safety resource:", error);
    res.status(500).json({ error: "Error adding safety resource." + error });
  }
};

exports.deleteOneSafetyResources = async (req, res) => {
  const resourceId = req.params.id;

  try {
    // Await the deletion of the resource
    const result = await safetyResources.deleteOne({
      _id: new ObjectId(resourceId),
    });

    if (result.deletedCount === 0) {
      return res.status(404).send("Resource not found");
    }

    res.status(200).send("Resource deleted successfully");
  } catch (err) {
    console.log("Error deleting the resource:", err);
    res.status(500).send("Error deleting the resource");
  }
};

exports.updateSafetyResource = async (req, res) => {
  const resourceId = req.params.id;
  const updatedData = req.body; // The updated data from the request body

  try {
    const result = await safetyResources.updateOne(
      { _id: new ObjectId(resourceId) },
      { $set: updatedData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send("Resource not found");
    }

    res.status(200).send("Resource updated successfully");
  } catch (err) {
    console.log("Error updating resource:", err);
    res.status(500).send("Error updating the resource");
  }
};

exports.getSafetyResource = async (req, res) => {
  const resourceId = req.params.id;

  try {
    const resource = await safetyResources.findOne({
      _id: new ObjectId(resourceId),
    });
    if (!resource) {
      return res.status(404).send("Resource not found");
    }

    res.status(200).json(resource); // Send the resource data as JSON
  } catch (err) {
    console.error("Error fetching resource:", err);
    res.status(500).send("Error fetching resource");
  }
};

// Get all safety resources
exports.userSafetyResources = async (req, res) => {
  try {
    console.log("Fetching all safety resources");
    // Fetch all safety resources from the database
    const resources = await safetyResources.find(
      {},
      "title type description link"
    );
    res.status(200).json({
      message: "Resources fetched successfully",
      data: resources,
    });
  } catch (error) {
    console.log("Error fetching safety resources:", error);
    res.status(500).json({ error: "Error fetching safety resources." + error });
  }
};
