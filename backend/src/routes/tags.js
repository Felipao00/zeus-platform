const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

router.use(authenticateToken);

router.get('/', (req, res) => {
    const tags = db.all('SELECT * FROM tags WHERE user_id = ?', [req.user.id]);
    res.json({ tags });
});

router.post('/', (req, res) => {
    const { name, color } = req.body;
    db.run(
        'INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)',
        [req.user.id, name, color]
    );
    res.status(201).json({ message: 'Tag criada!' });
});

module.exports = router;