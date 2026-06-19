const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'zeus-platform-secret-key-2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'zeus-refresh-secret-key-2024';

// Middleware de autenticação JWT
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                error: 'Acesso negado',
                message: 'Token de autenticação não fornecido.' 
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Buscar usuário
        const user = db.prepare(
            'SELECT id, username, email, full_name, role, is_active FROM users WHERE id = ?'
        ).get(decoded.id);

        if (!user || !user.is_active) {
            return res.status(403).json({ 
                error: 'Usuário inativo',
                message: 'Conta desativada ou não encontrada.' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ 
            error: 'Token inválido ou expirado',
            message: 'Faça login novamente.' 
        });
    }
};

// Gerar token JWT
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            username: user.username, 
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: '7d' }  // Mudar de '24h' para '7d'
    );
};

// Gerar refresh token
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
};

// Criar sessão no banco
const createSession = (userId, token, refreshToken, req) => {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const stmt = db.prepare(`
        INSERT INTO sessions (user_id, token, refresh_token, ip_address, user_agent, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
        userId,
        token,
        refreshToken,
        req.ip,
        req.get('user-agent'),
        expiresAt.toISOString()
    );
};

// Invalidar sessão
const invalidateSession = (sessionId) => {
    db.prepare('UPDATE sessions SET is_active = 0 WHERE id = ?').run(sessionId);
};

// Invalidar todas as sessões do usuário
const invalidateAllSessions = (userId) => {
    db.prepare('UPDATE sessions SET is_active = 0 WHERE user_id = ? AND is_active = 1').run(userId);
};

module.exports = {
    authenticateToken,
    generateToken,
    generateRefreshToken,
    createSession,
    invalidateSession,
    invalidateAllSessions
};