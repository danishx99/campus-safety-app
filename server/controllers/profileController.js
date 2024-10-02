const User = require('../schemas/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Logged in user information
exports.getUserDetails = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ email: decoded.userEmail }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt
    };

    res.json({ message: "Successfully got user details", user: userData });
  } catch (error) {
    console.log("Error getting user details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update user information
exports.updateUserDetails = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.userEmail;

    let updateData = {};
    if (req.body.phone) updateData.phone = req.body.phone;
    if (req.body.profilePicture) updateData.profilePicture = req.body.profilePicture;

    if (req.body.newPassword) {
      const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
