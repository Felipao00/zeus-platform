const PhotoService = require('../services/PhotoService');
const LogService = require('../services/LogService');

class PhotoController {
    // Upload de foto
    static async upload(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Nenhuma foto enviada.' });
            }

            const photoData = {
                userId: req.user.id,
                title: req.body.title || req.file.originalname,
                description: req.body.description || '',
                originalName: req.file.originalname,
                filename: req.file.filename,
                size: req.file.size,
                path: req.file.path,
                categoryId: req.body.category_id || null,
                takenAt: req.body.taken_at || null
            };

            const photo = await PhotoService.uploadPhoto(photoData);

            res.status(201).json({
                message: 'Foto enviada com sucesso!',
                photo
            });
        } catch (error) {
            console.error('Erro no upload de foto:', error);
            res.status(500).json({ error: error.message || 'Erro ao enviar foto.' });
        }
    }

    // Upload múltiplo de fotos
    static async uploadMultiple(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'Nenhuma foto enviada.' });
            }

            const uploadedPhotos = [];
            for (const file of req.files) {
                const photoData = {
                    userId: req.user.id,
                    originalName: file.originalname,
                    filename: file.filename,
                    size: file.size,
                    path: file.path,
                    categoryId: req.body.category_id
                };
                const photo = await PhotoService.uploadPhoto(photoData);
                uploadedPhotos.push(photo);
            }

            await LogService.createLog({
                userId: req.user.id,
                action: 'upload',
                entityType: 'photo',
                description: `${req.files.length} fotos enviadas`,
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            res.status(201).json({
                message: `${req.files.length} fotos enviadas com sucesso!`,
                photos: uploadedPhotos
            });
        } catch (error) {
            console.error('Erro no upload múltiplo:', error);
            res.status(500).json({ error: 'Erro ao enviar fotos.' });
        }
    }

    // Listar fotos
    static async getAll(req, res) {
        try {
            const { 
                category_id, 
                favorite, 
                search,
                sort_by = 'created_at',
                sort_order = 'DESC',
                page = 1, 
                limit = 50 
            } = req.query;

            const result = await PhotoService.getUserPhotos(req.user.id, {
                categoryId: category_id,
                favorite: favorite === 'true',
                search,
                sortBy: sort_by,
                sortOrder: sort_order,
                page: parseInt(page),
                limit: parseInt(limit)
            });

            res.json({
                photos: result.photos,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: result.total,
                    pages: Math.ceil(result.total / parseInt(limit))
                }
            });
        } catch (error) {
            console.error('Erro ao listar fotos:', error);
            res.status(500).json({ error: 'Erro ao listar fotos.' });
        }
    }

    // Buscar foto por ID
    static async getById(req, res) {
        try {
            const photo = await PhotoService.getPhotoById(req.params.id, req.user.id);
            if (!photo) {
                return res.status(404).json({ error: 'Foto não encontrada.' });
            }
            res.json({ photo });
        } catch (error) {
            console.error('Erro ao buscar foto:', error);
            res.status(500).json({ error: 'Erro ao buscar foto.' });
        }
    }

    // Atualizar foto
    static async update(req, res) {
        try {
            const { title, description, category_id, is_favorite } = req.body;
            
            const photo = await PhotoService.updatePhoto(req.params.id, req.user.id, {
                title,
                description,
                categoryId: category_id,
                isFavorite: is_favorite
            });

            await LogService.createLog({
                userId: req.user.id,
                action: 'update',
                entityType: 'photo',
                entityId: req.params.id,
                description: `Foto "${photo.title}" atualizada`,
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            res.json({
                message: 'Foto atualizada com sucesso!',
                photo
            });
        } catch (error) {
            console.error('Erro ao atualizar foto:', error);
            res.status(500).json({ error: 'Erro ao atualizar foto.' });
        }
    }

    // Deletar foto
    static async delete(req, res) {
        try {
            const photo = await PhotoService.deletePhoto(req.params.id, req.user.id);

            await LogService.createLog({
                userId: req.user.id,
                action: 'delete',
                entityType: 'photo',
                entityId: req.params.id,
                description: `Foto "${photo.title || photo.original_name}" excluída`,
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            res.json({
                message: 'Foto excluída com sucesso!',
                photo
            });
        } catch (error) {
            console.error('Erro ao deletar foto:', error);
            res.status(500).json({ error: 'Erro ao excluir foto.' });
        }
    }

    // Alternar favorito
    static async toggleFavorite(req, res) {
        try {
            const photo = await PhotoService.toggleFavorite(req.params.id, req.user.id);
            res.json({
                message: photo.is_favorite ? 'Foto marcada como favorita!' : 'Foto desmarcada como favorita!',
                photo
            });
        } catch (error) {
            console.error('Erro ao alternar favorito:', error);
            res.status(500).json({ error: 'Erro ao alternar favorito.' });
        }
    }
}

module.exports = PhotoController;