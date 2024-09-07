const User = require('../schemas/User');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Combine firstName and lastName for frontend
    const profileData = {
      ...user.toObject(),
      fullName: `${user.firstName} ${user.lastName}`,
      dateJoined: user.createdAt.toISOString().split('T')[0] // Format date as YYYY-MM-DD
    };
    res.json(profileData);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { firstName, lastName, phone },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error updating profile' });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating password' });
  }
};

exports.updateProfilePicture = async (req, res) => {
  try {
    const { profilePicture } = req.body;

    if (!profilePicture) {
      return res.status(400).json({ error: 'Profile picture is required' });
    }

    // Validate base64 string (basic check)
    if (!profilePicture.match(/^data:image\/(png|jpeg|jpg);base64,/)) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { profilePicture },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile picture updated successfully', user });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ error: 'Error updating profile picture' });
  }
};