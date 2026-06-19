const db = require('../config/database');
const LogService = require('../services/LogService');

class ProjectController {
    static async create(req, res) {
        try {
            const { name, description, status, priority, category_id, start_date, end_date, deadline, color } = req.body;
            
            const result = db.prepare(`
                INSERT INTO projects (user_id, name, description, status, priority, category_id, start_date, end_date, deadline, color)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(req.user.id, name, description, status || 'active', priority || 'medium', category_id, start_date, end_date, deadline, color);
            
            res.status(201).json({
                message: 'Projeto criado!',
                project: { id: result.lastInsertRowid, name }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getAll(req, res) {
        try {
            const { category_id, status, search } = req.query;
            let sql = 'SELECT p.*, c.name as category_name FROM projects p LEFT JOIN categories c ON p.category_id = c.id WHERE p.user_id = ?';
            const params = [req.user.id];
            
            if (category_id) { sql += ' AND p.category_id = ?'; params.push(category_id); }
            if (status) { sql += ' AND p.status = ?'; params.push(status); }
            if (search) { sql += ' AND (p.name LIKE ? OR p.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
            
            sql += ' ORDER BY p.updated_at DESC';
            const projects = db.all(sql, params);
            res.json({ projects });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const project = db.get(
                'SELECT p.*, c.name as category_name FROM projects p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ? AND p.user_id = ?',
                [req.params.id, req.user.id]
            );
            if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });
            res.json({ project });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { name, description, status, priority, category_id, start_date, end_date, deadline, color, progress } = req.body;
            
            db.prepare(`
                UPDATE projects SET name=?, description=?, status=?, priority=?, category_id=?, 
                start_date=?, end_date=?, deadline=?, color=?, progress=?, updated_at=CURRENT_TIMESTAMP
                WHERE id=? AND user_id=?
            `).run(name, description, status, priority, category_id, start_date, end_date, deadline, color, progress, req.params.id, req.user.id);
            
            res.json({ message: 'Projeto atualizado!' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            db.prepare('DELETE FROM projects WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
            res.json({ message: 'Projeto excluído!' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = ProjectController;