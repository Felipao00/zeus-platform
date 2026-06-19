const { getDatabase } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    const db = await getDatabase();
    
    const passwordHash = bcrypt.hashSync('admin123456', 10);
    
    try {
        db.run(`
            INSERT INTO users (username, email, password_hash, full_name, role)
            VALUES ('admin', 'admin@zeus.com', '${passwordHash}', 'Admin Zeus', 'admin')
        `);
        
        console.log('✅ Usuário admin criado com sucesso!');
        console.log('Email: admin@zeus.com');
        console.log('Senha: admin123456');
    } catch (error) {
        console.log('Erro:', error.message);
    }
}

createAdmin();