const express = require('express');
const router = express.Router();
const Settlement = require('../models/Settlement');
const Group = require('../models/Group');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/settlements
// @desc    Get settlements (all or by group)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { group_id } = req.query;
    let query = {};

    if (group_id) {
      query.groupId = group_id;
    } else {
      // Get all groups user is part of
      const userGroups = await Group.find({ members: req.user._id });
      const groupIds = userGroups.map((g) => g._id);
      query.groupId = { $in: groupIds };
    }

    const settlements = await Settlement.find(query).sort({ createdAt: -1 });

    const result = [];
    for (const settlement of settlements) {
      const paidByUser = await User.findById(settlement.paidBy);
      const paidToUser = await User.findById(settlement.paidTo);

      result.push({
        id: settlement._id,
        group_id: settlement.groupId,
        paid_by: settlement.paidBy,
        paid_by_name: paidByUser ? paidByUser.name : 'Unknown',
        paid_to: settlement.paidTo,
        paid_to_name: paidToUser ? paidToUser.name : 'Unknown',
        amount: settlement.amount,
        date: settlement.date.toISOString(),
        created_at: settlement.createdAt.toISOString(),
      });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: error.message });
  }
});

// @route   POST /api/settlements
// @desc    Create new settlement
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { group_id, paid_to, amount } = req.body;

    // Validate group
    const group = await Group.findById(group_id);
    if (!group) {
      return res.status(404).json({ detail: 'Group not found' });
    }

    // Check if user is member
    const isMember = group.members.some(
      (member) => member.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ detail: 'Not a member of this group' });
    }

    // Validate paid_to user
    const paidToUser = await User.findById(paid_to);
    if (!paidToUser) {
      return res.status(404).json({ detail: 'Paid to user not found' });
    }

    const isPaidToMember = group.members.some(
      (member) => member.toString() === paid_to
    );
    if (!isPaidToMember) {
      return res.status(400).json({ detail: 'Paid to user is not a member of this group' });
    }

    if (paid_to === req.user._id.toString()) {
      return res.status(400).json({ detail: 'Cannot settle with yourself' });
    }

    // Create settlement
    const settlement = await Settlement.create({
      groupId: group_id,
      paidBy: req.user._id,
      paidTo: paid_to,
      amount,
      date: new Date(),
    });

    res.status(201).json({
      id: settlement._id,
      group_id: settlement.groupId,
      paid_by: settlement.paidBy,
      paid_by_name: req.user.name,
      paid_to: settlement.paidTo,
      paid_to_name: paidToUser.name,
      amount: settlement.amount,
      date: settlement.date.toISOString(),
      created_at: settlement.createdAt.toISOString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: error.message });
  }
});

module.exports = router;