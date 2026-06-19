const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Criar diretórios de upload se não existirem
const createUploadDirs = () => {
    const dirs = [
        'uploads/files',
        'uploads/photos',
        'uploads/thumbnails',
        'uploads/temp',
        'uploads/backups'
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

createUploadDirs();

// Configuração para upload de arquivos
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userId = req.user.id;
        const userDir = `uploads/files/user_${userId}`;
        
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        
        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        const uniqueId = uuidv4();
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueId}${ext}`);
    }
});

// Configuração para upload de fotos
const photoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userId = req.user.id;
        const userDir = `uploads/photos/user_${userId}`;
        
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        
        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        const uniqueId = uuidv4();
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueId}${ext}`);
    }
});

// Filtro de arquivos permitidos
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'text/csv', 'application/json',
        'application/zip', 'application/x-rar-compressed',
        'video/mp4', 'audio/mpeg'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo não permitido'), false);
    }
};

// Configuração do multer
const uploadFile = multer({
    storage: fileStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024 // 100MB
    }
});

const uploadPhoto = multer({
    storage: photoStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas imagens são permitidas'), false);
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB para fotos
    }
});

module.exports = {
    uploadFile,
    uploadPhoto
};