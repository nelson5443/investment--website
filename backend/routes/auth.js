const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// Register customer
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
    const user = await User.create({ fullName, email, password });
    res.status(201).json({ token: generateToken(user._id), user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Register admin (requires secret key)
router.post('/register-admin', async (req, res) => {
  try {
    const { fullName, email, password, adminSecret } = req.body;
    if (adminSecret !== process.env.ADMIN_SECRET) return res.status(403).json({ message: 'Invalid admin secret' });
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
    const user = await User.create({ fullName, email, password, role: 'admin' });
    res.status(201).json({ token: generateToken(user._id), user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login (both admin and customer)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ message: 'Account suspended' });
    res.json({ token: generateToken(user._id), user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role, balance: user.balance } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
