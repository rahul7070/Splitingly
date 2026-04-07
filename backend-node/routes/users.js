const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Group = require('../models/Group');
const { protect } = require('../middleware/auth');

// @route   GET /api/users/friends
// @desc    Get friends (users in same groups)
// @access  Private
router.get('/friends', protect, async (req, res) => {
  try {
    // Get all groups where current user is a member
    const groups = await Group.find({ members: req.user._id });

    // Collect unique friend IDs
    const friendIds = new Set();
    groups.forEach((group) => {
      group.members.forEach((memberId) => {
        if (memberId.toString() !== req.user._id.toString()) {
          friendIds.add(memberId.toString());
        }
      });
    });

    // Get friend details
    const friends = await User.find({ _id: { $in: Array.from(friendIds) } }).select(
      '-password'
    );

    res.json(
      friends.map((friend) => ({
        id: friend._id,
        name: friend.name,
        email: friend.email,
        avatar: friend.avatar,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: error.message });
  }
});

// @route   GET /api/users/search
// @desc    Search users by email
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ detail: 'Query parameter is required' });
    }

    const users = await User.find({
      email: { $regex: query, $options: 'i' },
      _id: { $ne: req.user._id },
    })
      .limit(10)
      .select('-password');

    res.json(
      users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: error.message });
  }
});

module.exports = router;