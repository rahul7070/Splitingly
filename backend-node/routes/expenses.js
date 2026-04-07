const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Group = require('../models/Group');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/expenses
// @desc    Get expenses (all or by group)
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

    const expenses = await Expense.find(query).sort({ createdAt: -1 });

    // Get user names for splits
    const result = [];
    for (const expense of expenses) {
      const paidByUser = await User.findById(expense.paidBy);

      const splitsWithNames = [];
      for (const split of expense.splits) {
        const splitUser = await User.findById(split.userId);
        splitsWithNames.push({
          user_id: split.userId,
          user_name: splitUser ? splitUser.name : 'Unknown',
          amount: split.amount,
          percentage: split.percentage,
        });
      }

      result.push({
        id: expense._id,
        group_id: expense.groupId,
        description: expense.description,
        amount: expense.amount,
        paid_by: expense.paidBy,
        paid_by_name: paidByUser ? paidByUser.name : 'Unknown',
        split_type: expense.splitType,
        splits: splitsWithNames,
        category: expense.category,
        date: expense.date.toISOString(),
        created_at: expense.createdAt.toISOString(),
      });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: error.message });
  }
});

// @route   POST /api/expenses
// @desc    Create new expense
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { group_id, description, amount, split_type, splits, category, date } = req.body;

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

    // Process splits based on type
    let processedSplits = splits;
    if (split_type === 'equal') {
      const splitAmount = amount / splits.length;
      processedSplits = splits.map((split) => ({
        userId: split.user_id,
        amount: parseFloat(splitAmount.toFixed(2)),
      }));
    } else if (split_type === 'custom') {
      const totalSplit = splits.reduce((sum, split) => sum + split.amount, 0);
      if (Math.abs(totalSplit - amount) > 0.01) {
        return res.status(400).json({ detail: 'Split amounts must add up to total amount' });
      }
      processedSplits = splits.map((split) => ({
        userId: split.user_id,
        amount: split.amount,
      }));
    } else if (split_type === 'percentage') {
      const totalPercentage = splits.reduce((sum, split) => sum + split.percentage, 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        return res.status(400).json({ detail: 'Percentages must add up to 100' });
      }
      processedSplits = splits.map((split) => ({
        userId: split.user_id,
        amount: parseFloat(((amount * split.percentage) / 100).toFixed(2)),
        percentage: split.percentage,
      }));
    }

    // Create expense
    const expense = await Expense.create({
      groupId: group_id,
      description,
      amount,
      paidBy: req.user._id,
      splitType: split_type,
      splits: processedSplits,
      category,
      date: date ? new Date(date) : new Date(),
    });

    // Get split user names for response
    const splitsWithNames = [];
    for (const split of processedSplits) {
      const splitUser = await User.findById(split.userId);
      splitsWithNames.push({
        user_id: split.userId,
        user_name: splitUser ? splitUser.name : 'Unknown',
        amount: split.amount,
        percentage: split.percentage,
      });
    }

    res.status(201).json({
      id: expense._id,
      group_id: expense.groupId,
      description: expense.description,
      amount: expense.amount,
      paid_by: expense.paidBy,
      paid_by_name: req.user.name,
      split_type: expense.splitType,
      splits: splitsWithNames,
      category: expense.category,
      date: expense.date.toISOString(),
      created_at: expense.createdAt.toISOString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: error.message });
  }
});

module.exports = router;