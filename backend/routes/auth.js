const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('../config/db');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
const generateId = () => Date.now().toString();

// Register customer
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (db.users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: generateId(),
      fullName,
      email,
      password: hashedPassword,
      role: 'customer',
      balance: 0,
      totalInvested: 0,
      totalReturns: 0,
      isActive: true,
      isVerified: false,
      createdAt: new Date()
    };
    
    db.users.push(user);
    
    res.status(201).json({ 
      token: generateToken(user.id), 
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Register admin
router.post('/register-admin', async (req, res) => {
  try {
    const { fullName, email, password, adminSecret } = req.body;
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: 'Invalid admin secret' });
    }
    
    if (db.users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: generateId(),
      fullName,
      email,
      password: hashedPassword,
      role: 'admin',
      balance: 0,
      totalInvested: 0,
      totalReturns: 0,
      isActive: true,
      isVerified: true,
      createdAt: new Date()
    };
    
    db.users.push(user);
    
    res.status(201).json({ 
      token: generateToken(user.id), 
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    
    if (!user.isActive) return res.status(403).json({ message: 'Account suspended' });
    
    res.json({ 
      token: generateToken(user.id), 
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, balance: user.balance } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;