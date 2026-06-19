const db = require('../database/connection');
const bcrypt = require('bcryptjs');

class User {
    // Criar novo usuário
    static async create(userData) {
        const { username, email, password } = userData;
        const password_hash = await bcrypt.hash(password, 12);
        
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`,
                [username, email, password_hash],
                function(err) {
                    if (err) reject(err);
                    resolve({ id: this.lastID, username, email });
                }
            );
        });
    }

    // Buscar usuário por email
    static async findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM users WHERE email = ?',
                [email],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });
    }

    // Buscar usuário por ID
    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT id, username, email, full_name, avatar_url, storage_used, storage_limit, created_at FROM users WHERE id = ?',
                [id],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });
    }

    // Verificar senha
    static async verifyPassword(password, hash) {
        return bcrypt.compare(password, hash);
    }

    // Atualizar último login
    static async updateLastLogin(id) {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
                [id],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });
    }

    // Atualizar espaço utilizado
    static async updateStorageUsed(id, size) {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET storage_used = storage_used + ? WHERE id = ?',
                [size, id],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });
    }
}

module.exports = User;