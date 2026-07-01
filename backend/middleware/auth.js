const jwt = require('jsonwebtoken');
const { db } = require('../config/db');

exports.protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    db.get("SELECT * FROM users WHERE id = ?", [decoded.id], (err, user) => {
      if (!user) return res.status(401).json({ message: 'User not found' });
      req.user = user;
      next();
    });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access only' });
  next();
};