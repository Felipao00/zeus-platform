const db = require('../config/database');
const fs = require('fs');
const path = require('path');

class FileService {
    static async uploadFile({ userId, originalName, filename, size, mimeType, path: filePath, folderId, categoryId }) {
        const extension = path.extname(originalName).toLowerCase();
        const type = this.getFileType(mimeType);

        const stmt = db.prepare(`
            INSERT INTO files (
                user_id, name, original_name, type, extension, mime_type, 
                size, storage_path, folder_id, category_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            userId,
            originalName,
            originalName,
            type,
            extension,
            mimeType,
            size,
            filePath,
            folderId || null,
            categoryId || null
        );

        // Atualizar espaço utilizado
        db.prepare('UPDATE users SET storage_used = storage_used + ? WHERE id = ?')
            .run(size, userId);

        return {
            id: result.lastInsertRowid,
            original_name: originalName,
            type,
            size,
            mime_type: mimeType,
            folder_id: folderId,
            category_id: categoryId
        };
    }

    static getFileType(mimeType) {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'audio';
        if (mimeType.includes('pdf')) return 'document';
        if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
        if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
        if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compressed')) return 'archive';
        if (mimeType.includes('text/') || mimeType.includes('json')) return 'text';
        return 'other';
    }

    static async getUserFiles(userId, options = {}) {
        const {
            folderId, categoryId, type, search,
            sortBy = 'created_at', sortOrder = 'DESC',
            page = 1, limit = 50
        } = options;

        let query = 'SELECT f.*, c.name as category_name, c.color as category_color FROM files f LEFT JOIN categories c ON f.category_id = c.id WHERE f.user_id = ?';
        const params = [userId];

        if (folderId) {
            query += ' AND f.folder_id = ?';
            params.push(folderId);
        }

        if (categoryId) {
            query += ' AND f.category_id = ?';
            params.push(categoryId);
        }

        if (type) {
            query += ' AND f.type = ?';
            params.push(type);
        }

        if (search) {
            query += ' AND (f.name LIKE ? OR f.original_name LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        const countQuery = query.replace('SELECT f.*, c.name as category_name, c.color as category_color', 'SELECT COUNT(*) as total');
        const total = db.prepare(countQuery).get(...params).total;

        const validSortColumns = ['name', 'size', 'type', 'created_at', 'updated_at'];
        const validSortOrders = ['ASC', 'DESC'];
        
        const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
        const order = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder : 'DESC';

        query += ` ORDER BY f.${sortColumn} ${order} LIMIT ? OFFSET ?`;
        params.push(limit, (page - 1) * limit);

        const files = db.prepare(query).all(...params);

        return { files, total };
    }

    static async getFileById(id, userId) {
        return db.prepare('SELECT * FROM files WHERE id = ? AND user_id = ?').get(id, userId);
    }

    static async updateFile(id, userId, { name, description, folderId, categoryId, isStarred }) {
        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (folderId !== undefined) {
            updates.push('folder_id = ?');
            params.push(folderId);
        }
        if (categoryId !== undefined) {
            updates.push('category_id = ?');
            params.push(categoryId);
        }
        if (isStarred !== undefined) {
            updates.push('is_starred = ?');
            params.push(isStarred ? 1 : 0);
        }

        if (updates.length > 0) {
            updates.push('updated_at = CURRENT_TIMESTAMP');
            params.push(id, userId);
            
            db.prepare(`UPDATE files SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`)
                .run(...params);
        }

        return this.getFileById(id, userId);
    }

    static async deleteFile(id, userId) {
        const file = await this.getFileById(id, userId);
        if (!file) throw new Error('Arquivo não encontrado');

        // Remover arquivo físico
        if (fs.existsSync(file.storage_path)) {
            fs.unlinkSync(file.storage_path);
        }

        // Atualizar espaço
        db.prepare('UPDATE users SET storage_used = storage_used - ? WHERE id = ?')
            .run(file.size, userId);

        // Remover do banco
        db.prepare('DELETE FROM files WHERE id = ? AND user_id = ?').run(id, userId);

        return file;
    }

    static async incrementDownload(id) {
        db.prepare('UPDATE files SET download_count = download_count + 1 WHERE id = ?').run(id);
    }

    static async createFolder(userId, { name, parentId }) {
        const stmt = db.prepare(
            'INSERT INTO folders (user_id, name, parent_id) VALUES (?, ?, ?)'
        );
        const result = stmt.run(userId, name, parentId || null);
        
        return {
            id: result.lastInsertRowid,
            name,
            parent_id: parentId
        };
    }

    static async getFolders(userId, parentId = null) {
        if (parentId) {
            return db.prepare(
                'SELECT * FROM folders WHERE user_id = ? AND parent_id = ? ORDER BY name'
            ).all(userId, parentId);
        }
        return db.prepare(
            'SELECT * FROM folders WHERE user_id = ? AND parent_id IS NULL ORDER BY name'
        ).all(userId);
    }

    static async deleteFolder(id, userId) {
        db.prepare('DELETE FROM folders WHERE id = ? AND user_id = ?').run(id, userId);
    }
}

module.exports = FileService;