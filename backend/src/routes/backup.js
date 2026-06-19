const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

router.use(authenticateToken);

router.post('/create', async (req, res) => {
    try {
        const userId = req.user.id;
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const filename = `backup_${userId}_${timestamp}.zip`;
        const filepath = path.join('uploads/backups', filename);
        
        // Criar backup
        const output = fs.createWriteStream(filepath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        archive.pipe(output);
        
        // Adicionar dados do banco
        const tables = ['files', 'photos', 'projects', 'notes', 'links', 'categories', 'tags'];
        const data = {};
        tables.forEach(table => {
            data[table] = db.all(`SELECT * FROM ${table} WHERE user_id = ?`, [userId]);
        });
        
        archive.append(JSON.stringify(data, null, 2), { name: 'data.json' });
        await archive.finalize();
        
        // Registrar backup
        const stats = fs.statSync(filepath);
        db.run(
            'INSERT INTO backups (user_id, filename, filepath, size, type, format) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, filename, filepath, stats.size, 'full', 'zip']
        );
        
        res.json({ message: 'Backup criado com sucesso!', filename });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/', (req, res) => {
    const backups = db.all(
        'SELECT * FROM backups WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.id]
    );
    res.json({ backups });
});

router.get('/:id/download', (req, res) => {
    const backup = db.get(
        'SELECT * FROM backups WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id]
    );
    
    if (!backup) {
        return res.status(404).json({ error: 'Backup não encontrado' });
    }
    
    if (fs.existsSync(backup.filepath)) {
        res.download(backup.filepath, backup.filename);
    } else {
        res.status(404).json({ error: 'Arquivo de backup não encontrado' });
    }
});

module.exports = router;