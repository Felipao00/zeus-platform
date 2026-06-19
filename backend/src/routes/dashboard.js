const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

router.use(authenticateToken);

router.get('/stats', (req, res) => {
    const userId = req.user.id;
    
    const totalFiles = db.get('SELECT COUNT(*) as count FROM files WHERE user_id = ?', [userId])?.count || 0;
    const totalPhotos = db.get('SELECT COUNT(*) as count FROM photos WHERE user_id = ?', [userId])?.count || 0;
    const totalProjects = db.get('SELECT COUNT(*) as count FROM projects WHERE user_id = ?', [userId])?.count || 0;
    const totalNotes = db.get('SELECT COUNT(*) as count FROM notes WHERE user_id = ?', [userId])?.count || 0;
    const totalLinks = db.get('SELECT COUNT(*) as count FROM links WHERE user_id = ?', [userId])?.count || 0;
    
    const storageUsed = db.get('SELECT COALESCE(SUM(size), 0) as total FROM files WHERE user_id = ?', [userId])?.total || 0;
    const photoStorage = db.get('SELECT COALESCE(SUM(size), 0) as total FROM photos WHERE user_id = ?', [userId])?.total || 0;
    
    const recentActivities = db.all(
        'SELECT * FROM logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
        [userId]
    );
    
    res.json({
        totalFiles,
        totalPhotos,
        totalProjects,
        totalNotes,
        totalLinks,
        storageUsed: storageUsed + photoStorage,
        storageLimit: 10737418240,
        recentActivities,
        storageByType: {
            documents: storageUsed * 0.6,
            images: photoStorage,
            videos: storageUsed * 0.2,
            others: storageUsed * 0.2
        }
    });
});

module.exports = router;