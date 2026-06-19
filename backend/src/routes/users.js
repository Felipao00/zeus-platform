const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Placeholder - implementar conforme necessário
router.get('/profile', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;