const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('../config/db');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (db.users.find(u => u.email === email))
      return res.status(400).json({ message: 'Email already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = { id: Date.now().toString(), fullName, email, password: hashed, role: 'customer', balance: 0, isActive: true, isVerified: false, createdAt: new Date().toISOString() };
    db.users.push(user);
    res.status(201).json({ token: generateToken(user.id), user: { id: user.id, fullName, email, role: 'customer' } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/register-admin', async (req, res) => {
  try {
    const { fullName, email, password, adminSecret } = req.body;
    if (adminSecret !== process.env.ADMIN_SECRET)
      return res.status(403).json({ message: 'Invalid admin secret' });
    if (db.users.find(u => u.email === email))
      return res.status(400).json({ message: 'Email already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = { id: Date.now().toString(), fullName, email, password: hashed, role: 'admin', balance: 0, isActive: true, isVerified: true, createdAt: new Date().toISOString() };
    db.users.push(user);
    res.status(201).json({ token: generateToken(user.id), user: { id: user.id, fullName, email, role: 'admin' } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (!await bcrypt.compare(password, user.password)) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ message: 'Account suspended' });
    res.json({ token: generateToken(user.id), user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, balance: user.balance } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
