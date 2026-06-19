const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || './database/zeus.db';
const dbDir = path.dirname(DB_PATH);

// Garantir que o diretório existe
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

let db;

// Inicializar banco de dados
async function getDatabase() {
    if (db) return db;
    
    const SQL = await initSqlJs();
    
    // Carregar banco existente ou criar novo
    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }
    
    // Habilitar foreign keys
    db.run('PRAGMA foreign_keys = ON');
    
    // Salvar banco periodicamente
    setInterval(() => {
        saveDatabase();
    }, 5000);
    
    return db;
}

// Salvar banco em arquivo
function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
    }
}

// Executar query (substituto para db.run)
function run(sql, params = []) {
    try {
        db.run(sql, params);
        saveDatabase();
        return {
            lastInsertRowid: db.exec("SELECT last_insert_rowid()")[0]?.values[0][0],
            changes: db.getRowsModified()
        };
    } catch (error) {
        console.error('SQL Error:', error.message);
        throw error;
    }
}

// Executar query e retornar um resultado (substituto para db.get)
function get(sql, params = []) {
    try {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        if (stmt.step()) {
            const columns = stmt.getColumnNames();
            const values = stmt.get();
            const result = {};
            columns.forEach((col, index) => {
                result[col] = values[index];
            });
            stmt.free();
            return result;
        }
        stmt.free();
        return null;
    } catch (error) {
        console.error('SQL Error:', error.message);
        throw error;
    }
}

// Executar query e retornar todos resultados (substituto para db.all)
function all(sql, params = []) {
    try {
        const results = [];
        const stmt = db.prepare(sql);
        stmt.bind(params);
        while (stmt.step()) {
            const columns = stmt.getColumnNames();
            const values = stmt.get();
            const row = {};
            columns.forEach((col, index) => {
                row[col] = values[index];
            });
            results.push(row);
        }
        stmt.free();
        return results;
    } catch (error) {
        console.error('SQL Error:', error.message);
        throw error;
    }
}

// Executar SQL direto
function exec(sql) {
    try {
        db.run(sql);
        saveDatabase();
    } catch (error) {
        console.error('SQL Error:', error.message);
        throw error;
    }
}

// Preparar statement
function prepare(sql) {
    const stmt = db.prepare(sql);
    return {
        run: (...params) => {
            stmt.bind(params);
            stmt.step();
            stmt.free();
            saveDatabase();
            return {
                lastInsertRowid: db.exec("SELECT last_insert_rowid()")[0]?.values[0][0],
                changes: db.getRowsModified()
            };
        },
        get: (...params) => {
            stmt.bind(params);
            if (stmt.step()) {
                const columns = stmt.getColumnNames();
                const values = stmt.get();
                const result = {};
                columns.forEach((col, index) => {
                    result[col] = values[index];
                });
                stmt.free();
                return result;
            }
            stmt.free();
            return null;
        },
        all: (...params) => {
            const results = [];
            stmt.bind(params);
            while (stmt.step()) {
                const columns = stmt.getColumnNames();
                const values = stmt.get();
                const row = {};
                columns.forEach((col, index) => {
                    row[col] = values[index];
                });
                results.push(row);
            }
            stmt.free();
            return results;
        }
    };
}

module.exports = {
    getDatabase,
    saveDatabase,
    run,
    get,
    all,
    exec,
    prepare
};

// Manter conexão viva
process.on('exit', () => {
    if (db) {
        saveDatabase();
        db.close();
    }
});

process.on('SIGINT', () => {
    if (db) {
        saveDatabase();
        db.close();
    }
    process.exit(0);
});