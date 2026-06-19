const db = require('../config/database');

class NoteService {
    static async createNote(userId, { title, content, categoryId, color }) {
        const result = db.prepare(`
            INSERT INTO notes (user_id, title, content, category_id, color)
            VALUES (?, ?, ?, ?, ?)
        `).run(userId, title, content, categoryId || null, color || '#1F2937');

        return { id: result.lastInsertRowid, title, content };
    }

    static async getUserNotes(userId, options = {}) {
        const { categoryId, favorite, pinned, search, sortBy = 'updated_at', sortOrder = 'DESC', page = 1, limit = 50 } = options;
        
        let sql = 'SELECT * FROM notes WHERE user_id = ?';
        const params = [userId];

        if (categoryId) { sql += ' AND category_id = ?'; params.push(categoryId); }
        if (favorite) { sql += ' AND is_favorite = 1'; }
        if (pinned) { sql += ' AND is_pinned = 1'; }
        if (search) { sql += ' AND (title LIKE ? OR content LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

        const total = db.get(sql.replace('SELECT *', 'SELECT COUNT(*) as total'), params)?.total || 0;

        sql += ` ORDER BY is_pinned DESC, ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
        params.push(limit, (page - 1) * limit);

        const notes = db.all(sql, params);
        return { notes, total };
    }

    static async getNoteById(id, userId) {
        return db.get('SELECT * FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
    }

    static async updateNote(id, userId, { title, content, categoryId, isFavorite, isPinned, color }) {
        const updates = [];
        const params = [];
        
        if (title !== undefined) { updates.push('title = ?'); params.push(title); }
        if (content !== undefined) { updates.push('content = ?'); params.push(content); }
        if (categoryId !== undefined) { updates.push('category_id = ?'); params.push(categoryId); }
        if (isFavorite !== undefined) { updates.push('is_favorite = ?'); params.push(isFavorite ? 1 : 0); }
        if (isPinned !== undefined) { updates.push('is_pinned = ?'); params.push(isPinned ? 1 : 0); }
        if (color !== undefined) { updates.push('color = ?'); params.push(color); }
        
        if (updates.length > 0) {
            updates.push('updated_at = CURRENT_TIMESTAMP');
            params.push(id, userId);
            db.prepare(`UPDATE notes SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...params);
        }
        
        return this.getNoteById(id, userId);
    }

    static async deleteNote(id, userId) {
        const note = await this.getNoteById(id, userId);
        if (!note) throw new Error('Nota não encontrada');
        
        db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(id, userId);
        return note;
    }

    static async toggleFavorite(id, userId) {
        const note = await this.getNoteById(id, userId);
        if (!note) throw new Error('Nota não encontrada');
        
        db.prepare('UPDATE notes SET is_favorite = ? WHERE id = ?').run(note.is_favorite ? 0 : 1, id);
        return this.getNoteById(id, userId);
    }

    static async togglePin(id, userId) {
        const note = await this.getNoteById(id, userId);
        if (!note) throw new Error('Nota não encontrada');
        
        db.prepare('UPDATE notes SET is_pinned = ? WHERE id = ?').run(note.is_pinned ? 0 : 1, id);
        return this.getNoteById(id, userId);
    }
}

module.exports = NoteService;