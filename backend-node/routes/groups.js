const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/groups
// @desc    Get all groups for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id });

    res.json(
      groups.map((group) => ({
        id: group._id,
        name: group.name,
        description: group.description,
        avatar: group.avatar,
        members: group.members,
        created_by: group.createdBy,
        created_at: group.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: error.message });
  }
});

// @route   GET /api/groups/:id
// @desc    Get group by ID with member details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate(
      'members',
      'name email avatar'
    );

    if (!group) {
      return res.status(404).json({ detail: 'Group not found' });
    }

    // Check if user is member
    const isMember = group.members.some(
      (member) => member._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ detail: 'Not a member of this group' });
    }

    res.json({
      id: group._id,
      name: group.name,
      description: group.description,
      avatar: group.avatar,
      members: group.members.map((member) => ({
        id: member._id,
        name: member.name,
        email: member.email,
        avatar: member.avatar,
      })),
      created_by: group.createdBy,
      created_at: group.createdAt.toISOString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: error.message });
  }
});

// @route   POST /api/groups
// @desc    Create a new group
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, member_ids } = req.body;

    // Add current user to members
    const members = [req.user._id];

    // Validate and add other members
    if (member_ids && member_ids.length > 0) {
      for (const memberId of member_ids) {
        if (memberId !== req.user._id.toString()) {
          const user = await User.findById(memberId);
          if (!user) {
            return res.status(404).json({ detail: `User not found: ${memberId}` });
          }
          if (!members.includes(memberId)) {
            members.push(memberId);
          }
        }
      }
    }

    // Create group
    const group = await Group.create({
      name,
      description,
      avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${name}`,
      members,
      createdBy: req.user._id,
    });

    res.status(201).json({
      id: group._id,
      name: group.name,
      description: group.description,
      avatar: group.avatar,
      members: group.members,
      created_by: group.createdBy,
      created_at: group.createdAt.toISOString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: error.message });
  }
});

module.exports = router;