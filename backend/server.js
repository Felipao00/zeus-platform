require('dotenv').config();
const { getDatabase } = require('./src/config/database');

async function startServer() {
    try {
        // Inicializa o banco primeiro
        await getDatabase();
        console.log('[ZEUS] Banco de dados conectado com sucesso!');
        
        // Só depois carrega o app
        const app = require('./src/app');
        
        const PORT = process.env.PORT || 3001;
        
        const server = app.listen(PORT, () => {
            console.log(`[ZEUS] Servidor rodando na porta ${PORT}`);
            console.log(`[ZEUS] URL: http://localhost:${PORT}`);
            console.log(`[ZEUS] API: http://localhost:${PORT}/api`);
        });

        // Tratamento de erros do servidor
        server.on('error', (error) => {
            console.error('[ZEUS] Erro no servidor:', error);
        });

    } catch (error) {
        console.error('[ZEUS] Erro fatal ao iniciar:', error);
        process.exit(1);
    }
}

startServer();