const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Investment = require('../models/Investment');
const Plan = require('../models/Plan');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// Customer: request deposit or withdrawal
router.post('/', protect, async (req, res) => {
  try {
    const { type, amount, method, planId } = req.body;
    const transaction = await Transaction.create({ user: req.user._id, type, amount, method, planId: planId || null });
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Customer: get my transactions
router.get('/my', protect, async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id }).populate('planId', 'name roiPercent durationDays').sort('-createdAt');
  res.json(transactions);
});

// Admin: get all transactions
router.get('/', protect, adminOnly, async (req, res) => {
  const transactions = await Transaction.find().populate('user', 'fullName email').populate('planId', 'name roiPercent durationDays').sort('-createdAt');
  res.json(transactions);
});

// Admin: approve or reject transaction
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, note } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    transaction.status = status;
    transaction.note = note;
    await transaction.save();

    // If deposit approved, credit user balance
    if (status === 'approved' && transaction.type === 'deposit') {
      await User.findByIdAndUpdate(transaction.user, { $inc: { balance: transaction.amount } });

      // If deposit was linked to a plan, auto-create the investment
      if (transaction.planId) {
        const plan = await Plan.findById(transaction.planId);
        if (plan) {
          const expectedReturn = transaction.amount + (transaction.amount * plan.roiPercent) / 100;
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + plan.durationDays);
          await Investment.create({
            user: transaction.user,
            plan: plan._id,
            amountInvested: transaction.amount,
            expectedReturn,
            endDate
          });
          // Deduct invested amount from balance and update totalInvested
          await User.findByIdAndUpdate(transaction.user, {
            $inc: { balance: -transaction.amount, totalInvested: transaction.amount }
          });
        }
      }
    }

    // If withdrawal approved, deduct user balance
    if (status === 'approved' && transaction.type === 'withdrawal') {
      const user = await User.findById(transaction.user);
      if (user.balance < transaction.amount) return res.status(400).json({ message: 'User has insufficient balance' });
      await User.findByIdAndUpdate(transaction.user, { $inc: { balance: -transaction.amount } });
    }

    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
