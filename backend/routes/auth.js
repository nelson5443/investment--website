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
    
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
      if (row) return res.status(400).json({ message: 'Email already exists' });
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const id = generateId();
      
      db.run("INSERT INTO users (id, fullName, email, password) VALUES (?, ?, ?, ?)", 
        [id, fullName, email, hashedPassword], (err) => {
          if (err) return res.status(500).json({ message: err.message });
          
          res.status(201).json({ 
            token: generateToken(id), 
            user: { id, fullName, email, role: 'customer' } 
          });
        });
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
    
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
      if (row) return res.status(400).json({ message: 'Email already exists' });
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const id = generateId();
      
      db.run("INSERT INTO users (id, fullName, email, password, role, isVerified) VALUES (?, ?, ?, ?, 'admin', 1)", 
        [id, fullName, email, hashedPassword], (err) => {
          if (err) return res.status(500).json({ message: err.message });
          
          res.status(201).json({ 
            token: generateToken(id), 
            user: { id, fullName, email, role: 'admin' } 
          });
        });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
      
      if (!user.isActive) return res.status(403).json({ message: 'Account suspended' });
      
      res.json({ 
        token: generateToken(user.id), 
        user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, balance: user.balance } 
      });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;