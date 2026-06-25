const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');

exports.protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { password: false, id: true, fullName: true, email: true, role: true, balance: true, isActive: true } });
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ message: 'Admin access only' });
  next();
};
