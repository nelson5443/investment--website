const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// Get own profile
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// Admin: get all users
router.get('/', protect, adminOnly, async (req, res) => {
  const users = await User.find({ role: 'customer' }).select('-password');
  res.json(users);
});

// Admin: update user balance
router.put('/:id/balance', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { balance: req.body.balance }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: toggle user active status
router.put('/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('isActive');
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: !user.isActive },
      { new: true }
    ).select('isActive');
    res.json({ message: `User ${updated.isActive ? 'activated' : 'suspended'}`, isActive: updated.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
