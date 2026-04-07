const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');
const Group = require('../models/Group');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/balances
// @desc    Get user balances
// @access  Private
router.get('/balances', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all groups user is part of
    const userGroups = await Group.find({ members: userId });
    const groupIds = userGroups.map((g) => g._id);

    // Get all expenses
    const expenses = await Expense.find({ groupId: { $in: groupIds } });

    // Get all settlements
    const settlements = await Settlement.find({ groupId: { $in: groupIds } });

    // Calculate balances
    const balances = {};

    // Process expenses
    for (const expense of expenses) {
      const userSplit = expense.splits.find(
        (s) => s.userId.toString() === userId.toString()
      );

      if (userSplit) {
        if (expense.paidBy.toString() === userId.toString()) {
          // Current user paid - others owe them
          for (const split of expense.splits) {
            if (split.userId.toString() !== userId.toString()) {
              const otherUserId = split.userId.toString();
              balances[otherUserId] = (balances[otherUserId] || 0) + split.amount;
            }
          }
        } else {
          // Someone else paid - current user owes them
          const payerId = expense.paidBy.toString();
          balances[payerId] = (balances[payerId] || 0) - userSplit.amount;
        }
      }
    }

    // Process settlements
    for (const settlement of settlements) {
      if (settlement.paidBy.toString() === userId.toString()) {
        // Current user paid someone
        const paidToId = settlement.paidTo.toString();
        balances[paidToId] = (balances[paidToId] || 0) - settlement.amount;
      } else if (settlement.paidTo.toString() === userId.toString()) {
        // Someone paid current user
        const paidById = settlement.paidBy.toString();
        balances[paidById] = (balances[paidById] || 0) + settlement.amount;
      }
    }

    // Round balances to 2 decimal places
    Object.keys(balances).forEach((key) => {
      balances[key] = parseFloat(balances[key].toFixed(2));
    });

    res.json(balances);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: error.message });
  }
});

// @route   GET /api/activity
// @desc    Get activity feed
// @access  Private
router.get('/activity', protect, async (req, res) => {
  try {
    const { type } = req.query;
    const userId = req.user._id;

    // Get all groups user is part of
    const userGroups = await Group.find({ members: userId });
    const groupIds = userGroups.map((g) => g._id);

    // Create group name lookup
    const groupNames = {};
    userGroups.forEach((g) => {
      groupNames[g._id.toString()] = g.name;
    });

    const activities = [];

    // Get expenses
    if (!type || type === 'all' || type === 'expense') {
      const expenses = await Expense.find({ groupId: { $in: groupIds } });

      for (const expense of expenses) {
        const paidByUser = await User.findById(expense.paidBy);

        activities.push({
          id: expense._id,
          type: 'expense',
          description: expense.description,
          amount: expense.amount,
          group_id: expense.groupId,
          group_name: groupNames[expense.groupId.toString()] || 'Unknown Group',
          paid_by: expense.paidBy,
          paid_by_name: paidByUser ? paidByUser.name : 'Unknown',
          paid_to: null,
          paid_to_name: null,
          category: expense.category,
          split_type: expense.splitType,
          date: expense.date.toISOString(),
          created_at: expense.createdAt.toISOString(),
        });
      }
    }

    // Get settlements
    if (!type || type === 'all' || type === 'settlement') {
      const settlements = await Settlement.find({ groupId: { $in: groupIds } });

      for (const settlement of settlements) {
        const paidByUser = await User.findById(settlement.paidBy);
        const paidToUser = await User.findById(settlement.paidTo);

        activities.push({
          id: settlement._id,
          type: 'settlement',
          description: null,
          amount: settlement.amount,
          group_id: settlement.groupId,
          group_name: groupNames[settlement.groupId.toString()] || 'Unknown Group',
          paid_by: settlement.paidBy,
          paid_by_name: paidByUser ? paidByUser.name : 'Unknown',
          paid_to: settlement.paidTo,
          paid_to_name: paidToUser ? paidToUser.name : 'Unknown',
          category: null,
          split_type: null,
          date: settlement.date.toISOString(),
          created_at: settlement.createdAt.toISOString(),
        });
      }
    }

    // Sort by created_at descending
    activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: error.message });
  }
});

module.exports = router;