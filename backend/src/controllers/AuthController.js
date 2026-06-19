const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { generateToken, generateRefreshToken, createSession, invalidateSession } = require('../middleware/auth');
const LogService = require('../services/LogService');

class AuthController {
    // Registrar novo usuário
    static async register(req, res) {
        try {
            const { username, email, password, full_name } = req.body;

            // Validações
            if (!username || !email || !password) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
            }

            if (password.length < 8) {
                return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres.' });
            }

            // Verificar se usuário já existe
            const existingUser = db.prepare(
                'SELECT id FROM users WHERE email = ? OR username = ?'
            ).get(email, username);

            if (existingUser) {
                return res.status(400).json({ error: 'Usuário ou email já cadastrado.' });
            }

            // Hash da senha
            const password_hash = await bcrypt.hash(password, 12);

            // Inserir usuário
            const stmt = db.prepare(`
                INSERT INTO users (username, email, password_hash, full_name)
                VALUES (?, ?, ?, ?)
            `);

            const result = stmt.run(username, email, password_hash, full_name);

            // Criar categorias padrão
            const defaultCategories = [
                { name: 'Desenvolvimento', type: 'project', color: '#3B82F6' },
                { name: 'Design', type: 'project', color: '#8B5CF6' },
                { name: 'Pessoal', type: 'project', color: '#10B981' },
                { name: 'Trabalho', type: 'project', color: '#F59E0B' },
                { name: 'Estudos', type: 'project', color: '#EF4444' },
                { name: 'Documentos', type: 'file', color: '#6B7280' },
                { name: 'Fotos', type: 'photo', color: '#EC4899' }
            ];

            const insertCategory = db.prepare(`
                INSERT INTO categories (user_id, name, type, color)
                VALUES (?, ?, ?, ?)
            `);

            defaultCategories.forEach(cat => {
                insertCategory.run(result.lastInsertRowid, cat.name, cat.type, cat.color);
            });

            // Gerar tokens
            const user = { id: result.lastInsertRowid, username, email, role: 'user' };
            const token = generateToken(user);
            const refreshToken = generateRefreshToken(user);

            // Criar sessão
            createSession(user.id, token, refreshToken, req);

            // Log de registro
            LogService.createLog({
                userId: user.id,
                action: 'register',
                entityType: 'user',
                entityId: user.id,
                description: 'Novo usuário registrado',
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            res.status(201).json({
                message: 'Conta criada com sucesso!',
                token,
                refreshToken,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    full_name: full_name
                }
            });

        } catch (error) {
            console.error('Erro no registro:', error);
            res.status(500).json({ error: 'Erro ao criar conta.' });
        }
    }

    // Login
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
            }

            // Buscar usuário
            const user = db.prepare(
                'SELECT * FROM users WHERE email = ? AND is_active = 1'
            ).get(email);

            if (!user) {
                return res.status(401).json({ error: 'Credenciais inválidas.' });
            }

            // Verificar senha
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Credenciais inválidas.' });
            }

            // Gerar tokens
            const token = generateToken(user);
            const refreshToken = generateRefreshToken(user);

            // Criar sessão
            createSession(user.id, token, refreshToken, req);

            // Atualizar último login
            db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

            // Log de login
            LogService.createLog({
                userId: user.id,
                action: 'login',
                entityType: 'user',
                entityId: user.id,
                description: 'Login realizado',
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            res.json({
                message: 'Login realizado com sucesso!',
                token,
                refreshToken,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    avatar_url: user.avatar_url,
                    role: user.role
                }
            });

        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ error: 'Erro ao realizar login.' });
        }
    }

    // Logout
    static async logout(req, res) {
        try {
            // Invalidar sessão atual
            invalidateSession(req.sessionId);

            // Log de logout
            LogService.createLog({
                userId: req.user.id,
                action: 'logout',
                entityType: 'user',
                entityId: req.user.id,
                description: 'Logout realizado',
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            res.json({ message: 'Logout realizado com sucesso!' });
        } catch (error) {
            console.error('Erro no logout:', error);
            res.status(500).json({ error: 'Erro ao realizar logout.' });
        }
    }

    // Obter usuário atual
    static async getCurrentUser(req, res) {
        try {
            const user = db.prepare(`
                SELECT id, username, email, full_name, avatar_url, role, 
                       storage_used, storage_limit, created_at
                FROM users WHERE id = ?
            `).get(req.user.id);

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            res.json({ user });
        } catch (error) {
            console.error('Erro ao obter usuário:', error);
            res.status(500).json({ error: 'Erro ao obter dados do usuário.' });
        }
    }

    // Renovar token
    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            
            if (!refreshToken) {
                return res.status(400).json({ error: 'Refresh token não fornecido.' });
            }

            const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
            const user = db.prepare('SELECT * FROM users WHERE id = ? AND is_active = 1').get(decoded.id);

            if (!user) {
                return res.status(401).json({ error: 'Usuário não encontrado.' });
            }

            const newToken = generateToken(user);
            const newRefreshToken = generateRefreshToken(user);

            // Invalidar sessão antiga
            invalidateSession(req.sessionId);
            
            // Criar nova sessão
            createSession(user.id, newToken, newRefreshToken, req);

            res.json({
                token: newToken,
                refreshToken: newRefreshToken
            });

        } catch (error) {
            res.status(401).json({ error: 'Refresh token inválido.' });
        }
    }
}

module.exports = AuthController;