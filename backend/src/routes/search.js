const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

router.use(authenticateToken);

router.get('/', (req, res) => {
    const { q, type } = req.query;
    const userId = req.user.id;
    const search = `%${q}%`;
    
    const results = {};
    
    if (!type || type === 'files') {
        results.files = db.all(
            'SELECT * FROM files WHERE user_id = ? AND (name LIKE ? OR original_name LIKE ?) LIMIT 20',
            [userId, search, search]
        );
    }
    
    if (!type || type === 'photos') {
        results.photos = db.all(
            'SELECT * FROM photos WHERE user_id = ? AND (title LIKE ? OR description LIKE ?) LIMIT 20',
            [userId, search, search]
        );
    }
    
    if (!type || type === 'projects') {
        results.projects = db.all(
            'SELECT * FROM projects WHERE user_id = ? AND (name LIKE ? OR description LIKE ?) LIMIT 20',
            [userId, search, search]
        );
    }
    
    if (!type || type === 'notes') {
        results.notes = db.all(
            'SELECT * FROM notes WHERE user_id = ? AND (title LIKE ? OR content LIKE ?) LIMIT 20',
            [userId, search, search]
        );
    }
    
    if (!type || type === 'links') {
        results.links = db.all(
            'SELECT * FROM links WHERE user_id = ? AND (name LIKE ? OR url LIKE ? OR description LIKE ?) LIMIT 20',
            [userId, search, search]
        );
    }
    
    res.json(results);
});

module.exports = router;