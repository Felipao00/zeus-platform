const db = require('../config/database');

class LogService {
    static async createLog({ userId, action, entityType, entityId, description, ip, userAgent }) {
        try {
            const stmt = db.prepare(`
                INSERT INTO logs (user_id, action, entity_type, entity_id, description, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);

            stmt.run(
                userId,
                action,
                entityType || null,
                entityId || null,
                description || '',
                ip || '127.0.0.1',
                userAgent || 'Unknown'
            );
        } catch (error) {
            console.error('Erro ao criar log:', error);
        }
    }

    static async getUserLogs(userId, { page = 1, limit = 50, action } = {}) {
        let query = 'SELECT * FROM logs WHERE user_id = ?';
        const params = [userId];

        if (action) {
            query += ' AND action = ?';
            params.push(action);
        }

        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
        const total = db.prepare(countQuery).get(...params).total;

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, (page - 1) * limit);

        const logs = db.prepare(query).all(...params);

        return { logs, total };
    }
}

module.exports = LogService;