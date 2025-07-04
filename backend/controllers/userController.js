const User = require('../models/User');
const Trip = require('../models/Trip');
const Review = require('../models/Review');

exports.followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id; // user to be followed
    const currentUserId = req.user.userId;

    console.log('Trying to follow:', req.params.id);
    console.log('Current user ID:', req.user.userId);

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyFollowing = currentUser.followings.includes(targetUserId);

    if (alreadyFollowing) {
      // Unfollow logic
      currentUser.followings.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
      await currentUser.save();
      await targetUser.save();
      return res.status(200).json({ message: "User unfollowed" });
    } else {
      // Follow logic
      if (!currentUser.followings.includes(targetUserId)) {
        currentUser.followings.push(targetUserId);
      }
      if (!targetUser.followers.includes(currentUserId)) {
        targetUser.followers.push(currentUserId);
      }
      await currentUser.save();
      await targetUser.save();
      return res.status(200).json({ message: "User followed" });
    }
  } catch (err) {
    res.status(500).json({ message: "Follow action failed", error: err.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('followers', 'firstName lastName')
      .populate('trips')
      .populate('reviews');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fecth profile', error: err.message });
  }
}

exports.getSingleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'firstName lastName')
      .populate('trips')
      .populate('reviews');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load user', error: err.message });
  }
}

exports.updateUserProfile = async (userId, updatedData) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'bio', 'profilePicture', 'isPublic', 'location', 'travelStyle', 'dob'];
    const updates = {};
    for (const field of allowedFields) {
      if (updatedData[field] !== undefined) {
        updates[field] = updatedData[field];
      }
    }

    console.log('updateUserProfile - Updating user:', userId, 'with data:', updates);
    console.log('User Controller: Received data to update:', updatedData);
    console.log('User Controller: Filtered updates to be saved:', updates);
    // Update user in MongoDB using Mongoose
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true, select: '-password' } // Return updated document, validate, exclude password
    );

    if (!user) {
      console.log('updateUserProfile - User not found:', userId);
      return null;
    }

    console.log('updateUserProfile - Updated user:', user);
    return user;
  } catch (error) {
    console.error('updateUserProfile - Database error:', error.message);
    throw new Error(error.message);
  }
};

exports.getUserFollowings = async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user.userId)
      .populate('followings', '_id firstName lastName profilePicture');
    res.status(200).json(user.followings);
  } catch (error) {
    console.error('Error fetching followings:', error);
    res.status(500).json({ message: 'Failed to fetch followings' });
  }
};