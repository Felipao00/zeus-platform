require('dotenv').config();
const app = require('./src/app');
const { initDatabase } = require('./src/config/database');

const PORT = process.env.PORT || 3001;

async function startServer() {
    try {
        await initDatabase();
        console.log('[ZEUS] Banco de dados conectado e tabelas verificadas');
        
        app.listen(PORT, () => {
            console.log(`[ZEUS] Servidor rodando na porta ${PORT}`);
            console.log(`[ZEUS] Ambiente: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('[ZEUS] Erro ao iniciar:', error);
        process.exit(1);
    }
}

startServer();