const express = require('express');
const router = express.Router();
const Trade = require('../models/Trade');
const { protect, adminOnly } = require('../middleware/auth');

// Place a trade
router.post('/', protect, async (req, res) => {
  try {
    const { asset, assetType, type, quantity, priceAtTrade } = req.body;
    const total = quantity * priceAtTrade;
    const trade = await Trade.create({ user: req.user._id, asset, assetType, type, quantity, priceAtTrade, total });
    res.status(201).json(trade);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my trades
router.get('/my', protect, async (req, res) => {
  const trades = await Trade.find({ user: req.user._id }).sort('-createdAt');
  res.json(trades);
});

// Admin: get all trades
router.get('/', protect, adminOnly, async (req, res) => {
  const trades = await Trade.find().populate('user', 'fullName email').sort('-createdAt');
  res.json(trades);
});

module.exports = router;
