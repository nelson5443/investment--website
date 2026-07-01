const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', (req, res) => {
  res.json(db.plans.filter(p => p.isActive));
});

router.post('/invest', protect, (req, res) => {
  const { planId, amount } = req.body;
  const plan = db.plans.find(p => p.id === planId);
  const user = db.users.find(u => u.id === req.user.id);
  if (!plan) return res.status(404).json({ message: 'Plan not found' });
  if (!user || user.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });
  if (amount < plan.minAmount || amount > plan.maxAmount) return res.status(400).json({ message: `Amount must be between $${plan.minAmount} and $${plan.maxAmount}` });
  user.balance -= amount;
  user.totalInvested = (user.totalInvested || 0) + amount;
  const investment = { id: Date.now().toString(), userId: req.user.id, planId, planName: plan.name, amount, roiPercent: plan.roiPercent, durationDays: plan.durationDays, status: 'active', returns: 0, createdAt: new Date().toISOString() };
  db.investments.push(investment);
  res.status(201).json(investment);
});

router.get('/my', protect, (req, res) => {
  res.json(db.investments.filter(i => i.userId === req.user.id));
});

router.get('/all', protect, adminOnly, (req, res) => {
  res.json(db.investments);
});

router.post('/', protect, adminOnly, (req, res) => {
  const plan = { id: Date.now().toString(), ...req.body, isActive: true, createdAt: new Date().toISOString() };
  db.plans.push(plan);
  res.status(201).json(plan);
});

router.put('/:id', protect, adminOnly, (req, res) => {
  const plan = db.plans.find(p => p.id === req.params.id);
  if (!plan) return res.status(404).json({ message: 'Plan not found' });
  Object.assign(plan, req.body);
  res.json(plan);
});

router.delete('/:id', protect, adminOnly, (req, res) => {
  const plan = db.plans.find(p => p.id === req.params.id);
  if (!plan) return res.status(404).json({ message: 'Plan not found' });
  plan.isActive = false;
  res.json({ message: 'Plan deleted' });
});

module.exports = router;
