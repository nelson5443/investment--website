const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, (req, res) => {
  const msg = { id: Date.now().toString(), senderId: req.user.id, senderName: req.user.fullName, message: req.body.message, isAdminReply: false, createdAt: new Date().toISOString() };
  db.messages.push(msg);
  res.json(msg);
});

router.get('/my', protect, (req, res) => {
  res.json(db.messages.filter(m => m.senderId === req.user.id || m.receiverId === req.user.id));
});

router.get('/conversations', protect, adminOnly, (req, res) => {
  res.json(db.messages.map(m => ({
    ...m,
    sender: m.isAdminReply ? null : db.users.find(u => u.id === m.senderId) ? { _id: m.senderId, fullName: db.users.find(u => u.id === m.senderId)?.fullName } : null,
    receiver: m.receiverId
  })));
});

router.post('/reply', protect, adminOnly, (req, res) => {
  const msg = { id: Date.now().toString(), senderId: req.user.id, receiverId: req.body.userId, message: req.body.message, isAdminReply: true, createdAt: new Date().toISOString() };
  db.messages.push(msg);
  res.json(msg);
});

module.exports = router;
