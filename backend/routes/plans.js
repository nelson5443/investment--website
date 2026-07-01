const express = require('express');
const router = express.Router();
const { db } = require('../config/db');

// Get all active plans
router.get('/', async (req, res) => {
  db.all("SELECT * FROM plans WHERE isActive = 1", (err, plans) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(plans);
  });
});

module.exports = router;