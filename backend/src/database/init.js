const { getDatabase, exec } = require('../config/database');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function initDatabase() {
    console.log('[ZEUS] Inicializando banco de dados...');
    
    const db = await getDatabase();
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    try {
        exec(schema);
        console.log('[ZEUS] Banco de dados criado com sucesso!');
        console.log('[ZEUS] Tabelas criadas com sucesso!');
        
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_files_type ON files(type)',
            'CREATE INDEX IF NOT EXISTS idx_files_created_desc ON files(created_at DESC)',
            'CREATE INDEX IF NOT EXISTS idx_photos_created_desc ON photos(created_at DESC)',
            'CREATE INDEX IF NOT EXISTS idx_photos_favorite ON photos(is_favorite)',
            'CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)',
            'CREATE INDEX IF NOT EXISTS idx_notes_updated_desc ON notes(updated_at DESC)',
            'CREATE INDEX IF NOT EXISTS idx_notes_favorite ON notes(is_favorite)',
            'CREATE INDEX IF NOT EXISTS idx_links_favorite ON links(is_favorite)',
            'CREATE INDEX IF NOT EXISTS idx_logs_created_desc ON logs(created_at DESC)'
        ];
        
        indexes.forEach(index => {
            exec(index);
        });
        
        console.log('[ZEUS] Índices criados com sucesso!');
        
        // Criar usuário admin
        const passwordHash = bcrypt.hashSync('admin123456', 10);
        db.run(`INSERT INTO users (username, email, password_hash, full_name, role) VALUES ('admin', 'admin@zeus.com', '${passwordHash}', 'Admin Zeus', 'admin')`);
        console.log('[ZEUS] Usuário admin criado!');
        console.log('  Email: admin@zeus.com');
        console.log('  Senha: admin123456');
        
    } catch (error) {
        console.error('[ZEUS] Erro ao inicializar banco:', error.message);
        process.exit(1);
    }
}

initDatabase().then(() => {
    console.log('[ZEUS] Inicialização concluída!');
    process.exit(0);
}).catch(error => {
    console.error('[ZEUS] Erro fatal:', error);
    process.exit(1);
});