const express = require('express');
const router = express.Router();
const { db } = require('../config/db');

// Get all active plans
router.get('/', async (req, res) => {
  const plans = db.plans.filter(p => p.isActive);
  res.json(plans);
});

module.exports = router;