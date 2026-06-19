const db = require('../config/database');

class PhotoService {
    static async uploadPhoto({ userId, title, description, originalName, filename, size, path: filePath, categoryId, takenAt }) {
        const result = db.prepare(`
            INSERT INTO photos (user_id, category_id, title, description, filename, original_name, storage_path, size, taken_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(userId, categoryId || null, title || originalName, description, filename, originalName, filePath, size, takenAt);

        return {
            id: result.lastInsertRowid,
            title: title || originalName,
            original_name: originalName,
            size,
            category_id: categoryId
        };
    }

    static async getUserPhotos(userId, options = {}) {
        const { categoryId, favorite, search, sortBy = 'created_at', sortOrder = 'DESC', page = 1, limit = 50 } = options;
        
        let sql = 'SELECT * FROM photos WHERE user_id = ?';
        const params = [userId];

        if (categoryId) { sql += ' AND category_id = ?'; params.push(categoryId); }
        if (favorite) { sql += ' AND is_favorite = 1'; }
        if (search) { sql += ' AND (title LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

        const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
        const total = db.get(countSql, params)?.total || 0;

        sql += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
        params.push(limit, (page - 1) * limit);

        const photos = db.all(sql, params);
        return { photos, total };
    }

    static async getPhotoById(id, userId) {
        return db.get('SELECT * FROM photos WHERE id = ? AND user_id = ?', [id, userId]);
    }

    static async updatePhoto(id, userId, { title, description, categoryId, isFavorite }) {
        const updates = [];
        const params = [];
        
        if (title !== undefined) { updates.push('title = ?'); params.push(title); }
        if (description !== undefined) { updates.push('description = ?'); params.push(description); }
        if (categoryId !== undefined) { updates.push('category_id = ?'); params.push(categoryId); }
        if (isFavorite !== undefined) { updates.push('is_favorite = ?'); params.push(isFavorite ? 1 : 0); }
        
        if (updates.length > 0) {
            updates.push('updated_at = CURRENT_TIMESTAMP');
            params.push(id, userId);
            db.prepare(`UPDATE photos SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...params);
        }
        
        return this.getPhotoById(id, userId);
    }

    static async deletePhoto(id, userId) {
        const photo = await this.getPhotoById(id, userId);
        if (!photo) throw new Error('Foto não encontrada');
        
        db.prepare('DELETE FROM photos WHERE id = ? AND user_id = ?').run(id, userId);
        return photo;
    }

    static async toggleFavorite(id, userId) {
        const photo = await this.getPhotoById(id, userId);
        if (!photo) throw new Error('Foto não encontrada');
        
        db.prepare('UPDATE photos SET is_favorite = ? WHERE id = ?').run(photo.is_favorite ? 0 : 1, id);
        return this.getPhotoById(id, userId);
    }
}

module.exports = PhotoService;