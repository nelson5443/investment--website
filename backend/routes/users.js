const express = require('express');
const router = express.Router();
const { prisma } = require('../config/db');
const { protect, adminOnly } = require('../middleware/auth');

// Get own profile
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// Admin: get all users
router.get('/', protect, adminOnly, async (req, res) => {
  const users = await prisma.user.findMany({ 
    where: { role: 'CUSTOMER' },
    select: { password: false, id: true, fullName: true, email: true, role: true, balance: true, isActive: true, createdAt: true }
  });
  res.json(users);
});

// Admin: update user balance
router.put('/:id/balance', protect, adminOnly, async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { balance: req.body.balance },
      select: { password: false, id: true, fullName: true, email: true, balance: true }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: toggle user active status
router.put('/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: { isActive: true } });
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive },
      select: { isActive: true }
    });
    res.json({ message: `User ${updated.isActive ? 'activated' : 'suspended'}`, isActive: updated.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
