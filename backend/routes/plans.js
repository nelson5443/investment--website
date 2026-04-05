const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const Investment = require('../models/Investment');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// Get all active plans (public)
router.get('/', async (req, res) => {
  const plans = await Plan.find({ isActive: true });
  res.json(plans);
});

// Admin: create plan
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const plan = await Plan.create(req.body);
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: update plan
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: delete plan
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Plan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Customer: invest in a plan
router.post('/invest', protect, async (req, res) => {
  try {
    const { planId, amount } = req.body;
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    if (amount < plan.minAmount || amount > plan.maxAmount) return res.status(400).json({ message: `Amount must be between $${plan.minAmount} and $${plan.maxAmount}` });

    const user = await User.findById(req.user._id);
    if (user.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });

    const expectedReturn = amount + (amount * plan.roiPercent) / 100;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const investment = await Investment.create({ user: user._id, plan: planId, amountInvested: amount, expectedReturn, endDate });

    user.balance -= amount;
    user.totalInvested += amount;
    await user.save();

    res.status(201).json(investment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Customer: get my investments
router.get('/my', protect, async (req, res) => {
  const investments = await Investment.find({ user: req.user._id }).populate('plan');
  res.json(investments);
});

// Admin: get all investments
router.get('/all', protect, adminOnly, async (req, res) => {
  const investments = await Investment.find().populate('user', 'fullName email').populate('plan');
  res.json(investments);
});

module.exports = router;
