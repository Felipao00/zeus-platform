const db = require('../config/database');

class LinkController {
    static async create(req, res) {
        try {
            const { name, url, description, category_id } = req.body;
            const result = db.prepare(
                'INSERT INTO links (user_id, name, url, description, category_id) VALUES (?, ?, ?, ?, ?)'
            ).run(req.user.id, name, url, description, category_id);
            
            res.status(201).json({
                message: 'Link salvo!',
                link: { id: result.lastInsertRowid, name, url }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getAll(req, res) {
        try {
            const { category_id, favorite, search } = req.query;
            let sql = 'SELECT l.*, c.name as category_name FROM links l LEFT JOIN categories c ON l.category_id = c.id WHERE l.user_id = ?';
            const params = [req.user.id];
            
            if (category_id) { sql += ' AND l.category_id = ?'; params.push(category_id); }
            if (favorite === 'true') { sql += ' AND l.is_favorite = 1'; }
            if (search) { sql += ' AND (l.name LIKE ? OR l.url LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
            
            sql += ' ORDER BY l.created_at DESC';
            const links = db.all(sql, params);
            res.json({ links });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { name, url, description, category_id, is_favorite } = req.body;
            db.prepare(
                'UPDATE links SET name=?, url=?, description=?, category_id=?, is_favorite=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?'
            ).run(name, url, description, category_id, is_favorite ? 1 : 0, req.params.id, req.user.id);
            
            res.json({ message: 'Link atualizado!' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            db.prepare('DELETE FROM links WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
            res.json({ message: 'Link removido!' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = LinkController;