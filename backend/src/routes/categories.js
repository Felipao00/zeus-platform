const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

router.use(authenticateToken);

router.get('/', (req, res) => {
    const { type } = req.query;
    let sql = 'SELECT * FROM categories WHERE user_id = ?';
    const params = [req.user.id];
    
    if (type) {
        sql += ' AND type = ?';
        params.push(type);
    }
    
    const categories = db.all(sql, params);
    res.json({ categories });
});

router.post('/', (req, res) => {
    const { name, type, color, description } = req.body;
    db.run(
        'INSERT INTO categories (user_id, name, type, color, description) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, name, type, color, description]
    );
    res.status(201).json({ message: 'Categoria criada!' });
});

module.exports = router;