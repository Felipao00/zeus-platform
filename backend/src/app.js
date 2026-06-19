const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Importação das rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const fileRoutes = require('./routes/files');
const photoRoutes = require('./routes/photos');
const projectRoutes = require('./routes/projects');
const noteRoutes = require('./routes/notes');
const linkRoutes = require('./routes/links');
const vaultRoutes = require('./routes/vault');
const categoryRoutes = require('./routes/categories');
const tagRoutes = require('./routes/tags');
const dashboardRoutes = require('./routes/dashboard');
const backupRoutes = require('./routes/backup');
const searchRoutes = require('./routes/search');
const logRoutes = require('./routes/logs');

const app = express();

// Middleware de segurança
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/logs', logRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        platform: 'ZEUS',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

module.exports = app;