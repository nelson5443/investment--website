const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect, adminOnly } = require('../middleware/auth');

// Customer: send message
router.post('/', protect, async (req, res) => {
  try {
    const msg = await Message.create({ sender: req.user._id, message: req.body.message });
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Customer: get my chat history
router.get('/my', protect, async (req, res) => {
  const messages = await Message.find({ $or: [{ sender: req.user._id }, { receiver: req.user._id }] }).sort('createdAt');
  res.json(messages);
});

// Admin: get all conversations (unique users)
router.get('/conversations', protect, adminOnly, async (req, res) => {
  const messages = await Message.find()
    .populate('sender', 'fullName email')
    .populate('receiver', 'fullName email')
    .sort('createdAt');
  res.json(messages);
});

// Admin: reply to a user
router.post('/reply', protect, adminOnly, async (req, res) => {
  try {
    const msg = await Message.create({ sender: req.user._id, receiver: req.body.userId, message: req.body.message, isAdminReply: true });
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
