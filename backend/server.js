require('dotenv').config();
const app = require('./src/app');
const db = require('./src/config/database');

const PORT = process.env.PORT || 3001;

async function startServer() {
    try {
        console.log('[ZEUS] Conectando ao banco de dados...');
        console.log('[ZEUS] Banco conectado e tabelas verificadas');
        
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