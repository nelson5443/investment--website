const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/me', protect, (req, res) => {
  const { password, ...user } = req.user;
  res.json(user);
});

router.get('/', protect, adminOnly, (req, res) => {
  res.json(db.users.filter(u => u.role !== 'admin').map(({ password, ...u }) => u));
});

router.put('/:id/balance', protect, adminOnly, (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.balance = req.body.balance;
  const { password, ...safe } = user;
  res.json(safe);
});

router.put('/:id/toggle', protect, adminOnly, (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.isActive = !user.isActive;
  res.json({ message: `User ${user.isActive ? 'activated' : 'suspended'}`, isActive: user.isActive });
});

module.exports = router;
