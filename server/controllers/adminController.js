const safetyResources = require("../schemas/safetyResources");
const ObjectId = require("mongodb").ObjectId;

exports.adminSafetyResources = async (req, res) => {
  try {
    const { title, type, description } = req.body;
    const newResource = new safetyResources({
      title,
      type,
      description,
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
      const resource = await safetyResources.findOne({ _id: new ObjectId(resourceId) });
      if (!resource) {
          return res.status(404).send('Resource not found');
      }

      res.status(200).json(resource);  // Send the resource data as JSON
  } catch (err) {
      console.error('Error fetching resource:', err);
      res.status(500).send('Error fetching resource');
  }
};

/*exports.deleteAllSafetyResources = async (req, res) => {
    try {
      // Remove all documents from the safetyResources collection
      await safetyResources.deleteMany({});
      res.status(200).json({ message: "All safety resources have been deleted." });
    } catch (error) {
      console.log("Error deleting safety resources:", error);
      res.status(500).json({ error: "Error deleting safety resources." + error });
    }
  };*/
