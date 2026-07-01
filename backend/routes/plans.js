const express = require('express');
const router = express.Router();
const { db } = require('../config/db');

router.get('/', (req, res) => {
  res.json(db.plans.filter(p => p.isActive));
});

module.exports = router;
