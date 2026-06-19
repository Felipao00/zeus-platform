const { Pool } = require('pg');

// Configuração do banco
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Funções auxiliares compatíveis com o código existente
async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

async function run(sql, params = []) {
  const result = await query(sql, params);
  return {
    lastInsertRowid: result.rows[0]?.id,
    changes: result.rowCount
  };
}

async function get(sql, params = []) {
  const result = await query(sql, params);
  return result.rows[0] || null;
}

async function all(sql, params = []) {
  const result = await query(sql, params);
  return result.rows;
}

async function exec(sql) {
  await query(sql);
}

function prepare(sql) {
  return {
    run: (...params) => run(sql, params),
    get: (...params) => get(sql, params),
    all: (...params) => all(sql, params)
  };
}

// Inicializar tabelas
async function initDatabase() {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      secondary_password_hash VARCHAR(255),
      full_name VARCHAR(100),
      avatar_url VARCHAR(255),
      is_active BOOLEAN DEFAULT true,
      role VARCHAR(20) DEFAULT 'user',
      last_login TIMESTAMP,
      storage_used BIGINT DEFAULT 0,
      storage_limit BIGINT DEFAULT 10737418240,
      preferences TEXT DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      color VARCHAR(7) DEFAULT '#6B7280',
      icon VARCHAR(50),
      type VARCHAR(50),
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, name, type)
    );

    CREATE TABLE IF NOT EXISTS tags (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(50) NOT NULL,
      color VARCHAR(7),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, name)
    );

    CREATE TABLE IF NOT EXISTS folders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      parent_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      path VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS files (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      name VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      extension VARCHAR(20),
      mime_type VARCHAR(100),
      size BIGINT NOT NULL DEFAULT 0,
      storage_path VARCHAR(500) NOT NULL,
      description TEXT,
      is_encrypted BOOLEAN DEFAULT false,
      checksum VARCHAR(64),
      download_count INTEGER DEFAULT 0,
      is_starred BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS photos (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      title VARCHAR(255),
      description TEXT,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      storage_path VARCHAR(500) NOT NULL,
      thumbnail_path VARCHAR(500),
      size BIGINT NOT NULL DEFAULT 0,
      width INTEGER,
      height INTEGER,
      is_favorite BOOLEAN DEFAULT false,
      taken_at TIMESTAMP,
      exif_data TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) DEFAULT 'active',
      priority VARCHAR(20) DEFAULT 'medium',
      start_date DATE,
      end_date DATE,
      deadline DATE,
      progress INTEGER DEFAULT 0,
      budget DECIMAL(10,2),
      color VARCHAR(7),
      is_archived BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS project_files (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      file_id INTEGER REFERENCES files(id) ON DELETE CASCADE,
      photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE,
      link_id INTEGER,
      note_id INTEGER,
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      is_favorite BOOLEAN DEFAULT false,
      is_pinned BOOLEAN DEFAULT false,
      is_archived BOOLEAN DEFAULT false,
      color VARCHAR(7) DEFAULT '#1F2937',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS links (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      name VARCHAR(255) NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      favicon_url VARCHAR(500),
      is_favorite BOOLEAN DEFAULT false,
      click_count INTEGER DEFAULT 0,
      last_accessed TIMESTAMP,
      is_broken BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS secure_vault (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      title VARCHAR(255) NOT NULL,
      encrypted_data TEXT NOT NULL,
      iv VARCHAR(32) NOT NULL,
      auth_tag VARCHAR(64),
      type VARCHAR(50) DEFAULT 'credential',
      notes_encrypted TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS item_tags (
      id SERIAL PRIMARY KEY,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      item_type VARCHAR(50) NOT NULL,
      item_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(tag_id, item_type, item_id)
    );

    CREATE TABLE IF NOT EXISTS logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      action VARCHAR(50) NOT NULL,
      entity_type VARCHAR(50),
      entity_id INTEGER,
      description TEXT,
      metadata TEXT,
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS backups (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      filename VARCHAR(255) NOT NULL,
      filepath VARCHAR(500) NOT NULL,
      size BIGINT NOT NULL DEFAULT 0,
      type VARCHAR(50) NOT NULL DEFAULT 'full',
      format VARCHAR(20) NOT NULL DEFAULT 'json',
      status VARCHAR(20) DEFAULT 'completed',
      items_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(500) NOT NULL,
      refresh_token VARCHAR(500),
      ip_address VARCHAR(45),
      user_agent TEXT,
      is_active BOOLEAN DEFAULT true,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await exec(schema);
    console.log('[ZEUS] Tabelas criadas/verificadas com sucesso!');
    
    // Criar admin se não existir
    const bcrypt = require('bcryptjs');
    const existingAdmin = await get('SELECT id FROM users WHERE email = ?', ['admin@zeus.com']);
    
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('admin123456', 10);
      await run(
        'INSERT INTO users (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
        ['admin', 'admin@zeus.com', passwordHash, 'Admin Zeus', 'admin']
      );
      console.log('[ZEUS] Usuário admin criado!');
      console.log('  Email: admin@zeus.com');
      console.log('  Senha: admin123456');
    }
  } catch (error) {
    console.error('[ZEUS] Erro ao criar tabelas:', error.message);
    throw error;
  }
}

// Inicializa ao importar
if (process.env.NODE_ENV !== 'test') {
  initDatabase().catch(console.error);
}

// Manter conexão viva
setInterval(async () => {
  try {
    await query('SELECT 1');
  } catch (error) {}
}, 30000);

module.exports = {
  query,
  run,
  get,
  all,
  exec,
  prepare,
  pool
};