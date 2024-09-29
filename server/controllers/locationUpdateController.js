const User = require("../schemas/User");


exports.updateLocation = async (req, res) => {
    try {
        const { longitude, latitude } = req.body;

        // Find the user by email and update the location
        const user = await User.findOneAndUpdate(
            { email: req.userEmail },
            { location: [longitude, latitude] },
            { new: true } // Return the modified document
        );

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        res.status(200).json({ message: "Location updated successfully" });

    } catch (error) {
        console.error("Error updating location:", error);
        res.status(500).json({ error: "Error updating location." });
    }
};
