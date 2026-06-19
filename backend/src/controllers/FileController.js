const FileService = require('../services/FileService');
const LogService = require('../services/LogService');
const path = require('path');
const fs = require('fs');

class FileController {
    // Upload de arquivo
    static async upload(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
            }

            const fileData = {
                userId: req.user.id,
                originalName: req.file.originalname,
                filename: req.file.filename,
                size: req.file.size,
                mimeType: req.file.mimetype,
                path: req.file.path,
                folderId: req.body.folder_id || null,
                categoryId: req.body.category_id || null
            };

            const file = await FileService.uploadFile(fileData);

            await LogService.createLog({
                userId: req.user.id,
                action: 'upload',
                entityType: 'file',
                entityId: file.id,
                description: `Arquivo "${file.original_name}" enviado (${(file.size / 1024).toFixed(2)} KB)`,
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            res.status(201).json({
                message: 'Arquivo enviado com sucesso!',
                file
            });
        } catch (error) {
            console.error('Erro no upload:', error);
            res.status(500).json({ error: error.message || 'Erro ao enviar arquivo.' });
        }
    }

    // Upload múltiplo
    static async uploadMultiple(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
            }

            const uploadedFiles = [];
            for (const file of req.files) {
                const fileData = {
                    userId: req.user.id,
                    originalName: file.originalname,
                    filename: file.filename,
                    size: file.size,
                    mimeType: file.mimetype,
                    path: file.path,
                    folderId: req.body.folder_id || null,
                    categoryId: req.body.category_id || null
                };
                const uploaded = await FileService.uploadFile(fileData);
                uploadedFiles.push(uploaded);
            }

            await LogService.createLog({
                userId: req.user.id,
                action: 'upload',
                entityType: 'file',
                description: `${req.files.length} arquivos enviados`,
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            res.status(201).json({
                message: `${req.files.length} arquivos enviados com sucesso!`,
                files: uploadedFiles
            });
        } catch (error) {
            console.error('Erro no upload múltiplo:', error);
            res.status(500).json({ error: error.message || 'Erro ao enviar arquivos.' });
        }
    }

    // Listar arquivos
    static async getAll(req, res) {
        try {
            const { 
                folder_id, 
                category_id, 
                type, 
                search, 
                sort_by = 'created_at', 
                sort_order = 'DESC',
                page = 1, 
                limit = 50 
            } = req.query;

            const result = await FileService.getUserFiles(req.user.id, {
                folderId: folder_id,
                categoryId: category_id,
                type,
                search,
                sortBy: sort_by,
                sortOrder: sort_order,
                page: parseInt(page),
                limit: parseInt(limit)
            });

            res.json({
                files: result.files,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: result.total,
                    pages: Math.ceil(result.total / parseInt(limit))
                }
            });
        } catch (error) {
            console.error('Erro ao listar arquivos:', error);
            res.status(500).json({ error: 'Erro ao listar arquivos.' });
        }
    }

    // Buscar arquivo por ID
    static async getById(req, res) {
        try {
            const file = await FileService.getFileById(req.params.id, req.user.id);
            if (!file) {
                return res.status(404).json({ error: 'Arquivo não encontrado.' });
            }
            res.json({ file });
        } catch (error) {
            console.error('Erro ao buscar arquivo:', error);
            res.status(500).json({ error: 'Erro ao buscar arquivo.' });
        }
    }

    // Atualizar arquivo
    static async update(req, res) {
        try {
            const { name, description, folder_id, category_id, is_starred } = req.body;
            
            const file = await FileService.updateFile(req.params.id, req.user.id, {
                name,
                description,
                folderId: folder_id,
                categoryId: category_id,
                isStarred: is_starred
            });

            await LogService.createLog({
                userId: req.user.id,
                action: 'update',
                entityType: 'file',
                entityId: req.params.id,
                description: `Arquivo "${file.name}" atualizado`,
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            res.json({
                message: 'Arquivo atualizado com sucesso!',
                file
            });
        } catch (error) {
            console.error('Erro ao atualizar arquivo:', error);
            res.status(500).json({ error: 'Erro ao atualizar arquivo.' });
        }
    }

    // Deletar arquivo
    static async delete(req, res) {
        try {
            const file = await FileService.deleteFile(req.params.id, req.user.id);

            await LogService.createLog({
                userId: req.user.id,
                action: 'delete',
                entityType: 'file',
                entityId: req.params.id,
                description: `Arquivo "${file.original_name}" excluído`,
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            res.json({
                message: 'Arquivo excluído com sucesso!',
                file
            });
        } catch (error) {
            console.error('Erro ao deletar arquivo:', error);
            res.status(500).json({ error: 'Erro ao excluir arquivo.' });
        }
    }

    // Download de arquivo
    static async download(req, res) {
        try {
            const file = await FileService.getFileById(req.params.id, req.user.id);
            if (!file) {
                return res.status(404).json({ error: 'Arquivo não encontrado.' });
            }

            const filePath = path.resolve(file.storage_path);
            
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ error: 'Arquivo não encontrado no servidor.' });
            }

            // Incrementar contador de download
            await FileService.incrementDownload(req.params.id);

            res.download(filePath, file.original_name);
        } catch (error) {
            console.error('Erro ao baixar arquivo:', error);
            res.status(500).json({ error: 'Erro ao baixar arquivo.' });
        }
    }

    // Criar pasta
    static async createFolder(req, res) {
        try {
            const { name, parent_id } = req.body;

            if (!name) {
                return res.status(400).json({ error: 'Nome da pasta é obrigatório.' });
            }

            const folder = await FileService.createFolder(req.user.id, {
                name,
                parentId: parent_id || null
            });

            res.status(201).json({
                message: 'Pasta criada com sucesso!',
                folder
            });
        } catch (error) {
            console.error('Erro ao criar pasta:', error);
            res.status(500).json({ error: 'Erro ao criar pasta.' });
        }
    }

    // Listar pastas
    static async getFolders(req, res) {
        try {
            const { parent_id } = req.query;
            const folders = await FileService.getFolders(req.user.id, parent_id || null);
            res.json({ folders });
        } catch (error) {
            console.error('Erro ao listar pastas:', error);
            res.status(500).json({ error: 'Erro ao listar pastas.' });
        }
    }

    // Deletar pasta
    static async deleteFolder(req, res) {
        try {
            await FileService.deleteFolder(req.params.id, req.user.id);
            res.json({ message: 'Pasta excluída com sucesso!' });
        } catch (error) {
            console.error('Erro ao deletar pasta:', error);
            res.status(500).json({ error: 'Erro ao excluir pasta.' });
        }
    }
}

module.exports = FileController;