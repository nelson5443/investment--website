const express = require('express');
const router = express.Router();

router.get('/my', (req, res) => res.json([]));
router.post('/', (req, res) => res.json({ message: 'Trade placed' }));

module.exports = router;