const express = require('express');
const router = express.Router();
const { prisma } = require('../config/db');
const { protect, adminOnly } = require('../middleware/auth');

// Get all active plans (public)
router.get('/', async (req, res) => {
  const plans = await prisma.plan.findMany({ where: { isActive: true } });
  res.json(plans);
});

// Admin: create plan
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const plan = await prisma.plan.create({ data: req.body });
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Customer: invest in a plan
router.post('/invest', protect, async (req, res) => {
  try {
    const { planId, amount } = req.body;
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) return res.status(400).json({ message: 'Plan not available' });
    if (amount < plan.minAmount || amount > plan.maxAmount) {
      return res.status(400).json({ message: `Amount must be between $${plan.minAmount} and $${plan.maxAmount}` });
    }
    if (req.user.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });

    const roiAmount = (amount * plan.roiPercent) / 100;
    const endDate = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.investment.create({
        data: { userId: req.user.id, planId, amount, roiAmount, endDate }
      }),
      prisma.user.update({
        where: { id: req.user.id },
        data: { balance: { decrement: amount }, totalInvested: { increment: amount } }
      })
    ]);

    res.json({ message: 'Investment successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Customer: get my investments
router.get('/my', protect, async (req, res) => {
  const investments = await prisma.investment.findMany({
    where: { userId: req.user.id },
    include: { plan: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(investments);
});

module.exports = router;