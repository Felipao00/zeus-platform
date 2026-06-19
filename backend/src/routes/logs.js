const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const LogService = require('../services/LogService');

router.use(authenticateToken);

router.get('/', async (req, res) => {
    try {
        const { page, limit, action } = req.query;
        const result = await LogService.getUserLogs(req.user.id, { page, limit, action });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;