const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, (req, res) => {
  const { symbol, type, amount, price } = req.body;
  const user = db.users.find(u => u.id === req.user.id);
  if (!user || user.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });
  user.balance -= amount;
  const trade = { id: Date.now().toString(), userId: req.user.id, symbol, type, amount, price, profit: 0, status: 'open', createdAt: new Date().toISOString() };
  db.trades.push(trade);
  res.status(201).json(trade);
});

router.get('/my', protect, (req, res) => {
  res.json(db.trades.filter(t => t.userId === req.user.id));
});

router.get('/', protect, adminOnly, (req, res) => {
  res.json(db.trades);
});

module.exports = router;
