const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, (req, res) => {
  const tx = { id: Date.now().toString(), userId: req.user.id, user: { fullName: req.user.fullName, email: req.user.email }, type: req.body.type, amount: req.body.amount, method: req.body.method || null, status: 'pending', note: '', createdAt: new Date().toISOString() };
  db.transactions.push(tx);
  res.status(201).json(tx);
});

router.get('/my', protect, (req, res) => {
  res.json(db.transactions.filter(t => t.userId === req.user.id));
});

router.get('/', protect, adminOnly, (req, res) => {
  res.json(db.transactions);
});

router.put('/:id', protect, adminOnly, (req, res) => {
  const tx = db.transactions.find(t => t.id === req.params.id);
  if (!tx) return res.status(404).json({ message: 'Transaction not found' });
  tx.status = req.body.status;
  tx.note = req.body.note || '';
  if (tx.status === 'approved') {
    const user = db.users.find(u => u.id === tx.userId);
    if (user) {
      if (tx.type === 'deposit') user.balance += tx.amount;
      if (tx.type === 'withdrawal') user.balance = Math.max(0, user.balance - tx.amount);
    }
  }
  res.json(tx);
});

module.exports = router;
