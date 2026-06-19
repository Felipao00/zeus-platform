const CryptoJS = require('crypto-js');
const db = require('../config/database');
const LogService = require('../services/LogService');

class VaultController {
    // Criar item no cofre
    static async create(req, res) {
        try {
            const { title, data, type, notes, category_id, secondary_password } = req.body;

            if (!title || !data) {
                return res.status(400).json({ error: 'Título e dados são obrigatórios.' });
            }

            if (!secondary_password) {
                return res.status(400).json({ error: 'Senha secundária é obrigatória.' });
            }

            // Gerar IV aleatório
            const iv = CryptoJS.lib.WordArray.random(16);
            
            // Usar a senha como chave de criptografia
            const encryptionKey = secondary_password;
            const encrypted = CryptoJS.AES.encrypt(
                JSON.stringify(data),
                encryptionKey,
                { iv: iv }
            );

            const result = db.prepare(`
                INSERT INTO secure_vault (user_id, category_id, title, encrypted_data, iv, type, notes_encrypted)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
                req.user.id,
                category_id || null,
                title,
                encrypted.toString(),
                iv.toString(),
                type || 'credential',
                notes || ''
            );

            await LogService.createLog({
                userId: req.user.id,
                action: 'create',
                entityType: 'vault',
                entityId: result.lastInsertRowid,
                description: `Item "${title}" adicionado ao cofre`,
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            res.status(201).json({
                message: 'Item adicionado ao cofre com sucesso!',
                item: {
                    id: result.lastInsertRowid,
                    title,
                    type: type || 'credential',
                    category_id: category_id || null
                }
            });
        } catch (error) {
            console.error('Erro ao criar item no cofre:', error);
            res.status(500).json({ error: 'Erro ao salvar no cofre.' });
        }
    }

    // Listar itens do cofre (apenas metadados)
    static async getAll(req, res) {
        try {
            const items = db.all(
                'SELECT id, title, type, category_id, created_at, updated_at FROM secure_vault WHERE user_id = ? ORDER BY updated_at DESC',
                [req.user.id]
            );
            res.json({ items });
        } catch (error) {
            console.error('Erro ao listar cofre:', error);
            res.status(500).json({ error: 'Erro ao listar itens do cofre.' });
        }
    }

    // Visualizar item do cofre (requer senha secundária)
    static async view(req, res) {
        try {
            const { secondary_password } = req.body;

            if (!secondary_password) {
                return res.status(400).json({ error: 'Senha secundária é obrigatória.' });
            }

            // Buscar item
            const item = db.get(
                'SELECT * FROM secure_vault WHERE id = ? AND user_id = ?',
                [req.params.id, req.user.id]
            );

            if (!item) {
                return res.status(404).json({ error: 'Item não encontrado.' });
            }

            // Descriptografar
            const encryptionKey = secondary_password;
            const decrypted = CryptoJS.AES.decrypt(
                item.encrypted_data,
                encryptionKey,
                { iv: CryptoJS.enc.Hex.parse(item.iv) }
            );

            const data = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

            await LogService.createLog({
                userId: req.user.id,
                action: 'view',
                entityType: 'vault',
                entityId: item.id,
                description: `Item "${item.title}" visualizado no cofre`,
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            res.json({
                item: {
                    id: item.id,
                    title: item.title,
                    type: item.type,
                    data: data,
                    notes: item.notes_encrypted,
                    category_id: item.category_id,
                    created_at: item.created_at,
                    updated_at: item.updated_at
                }
            });
        } catch (error) {
            console.error('Erro ao visualizar item:', error);
            res.status(403).json({ error: 'Senha secundária incorreta ou dados corrompidos.' });
        }
    }

    // Atualizar item do cofre
    static async update(req, res) {
        try {
            const { title, data, type, notes, category_id, secondary_password } = req.body;

            if (!secondary_password) {
                return res.status(400).json({ error: 'Senha secundária é obrigatória.' });
            }

            const iv = CryptoJS.lib.WordArray.random(16);
            const encryptionKey = secondary_password;
            const encrypted = CryptoJS.AES.encrypt(
                JSON.stringify(data),
                encryptionKey,
                { iv: iv }
            );

            db.prepare(`
                UPDATE secure_vault 
                SET title = ?, encrypted_data = ?, iv = ?, type = ?, 
                    notes_encrypted = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND user_id = ?
            `).run(
                title,
                encrypted.toString(),
                iv.toString(),
                type,
                notes || '',
                category_id,
                req.params.id,
                req.user.id
            );

            res.json({ message: 'Item atualizado com sucesso!' });
        } catch (error) {
            console.error('Erro ao atualizar item:', error);
            res.status(500).json({ error: 'Erro ao atualizar item.' });
        }
    }

    // Deletar item do cofre
    static async delete(req, res) {
        try {
            const { secondary_password } = req.body;

            if (!secondary_password) {
                return res.status(400).json({ error: 'Senha secundária é obrigatória.' });
            }

            const item = db.get(
                'SELECT * FROM secure_vault WHERE id = ? AND user_id = ?',
                [req.params.id, req.user.id]
            );

            if (!item) {
                return res.status(404).json({ error: 'Item não encontrado.' });
            }

            db.prepare('DELETE FROM secure_vault WHERE id = ? AND user_id = ?')
                .run(req.params.id, req.user.id);

            await LogService.createLog({
                userId: req.user.id,
                action: 'delete',
                entityType: 'vault',
                entityId: req.params.id,
                description: 'Item removido do cofre',
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            res.json({ message: 'Item removido do cofre com sucesso!' });
        } catch (error) {
            console.error('Erro ao deletar item:', error);
            res.status(500).json({ error: 'Erro ao remover item.' });
        }
    }
}

module.exports = VaultController;