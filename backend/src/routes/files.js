const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const FileController = require('../controllers/FileController');

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/files/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// Todas as rotas protegidas
router.use(authenticateToken);

// CRUD de arquivos
router.post('/upload', upload.single('file'), FileController.upload);
router.get('/', FileController.getAll);
router.get('/:id', FileController.getById);
router.put('/:id', FileController.update);
router.delete('/:id', FileController.delete);
router.get('/:id/download', FileController.download);

// Pastas
router.post('/folders', FileController.createFolder);
router.get('/folders/list', FileController.getFolders);
router.delete('/folders/:id', FileController.deleteFolder);

module.exports = router;