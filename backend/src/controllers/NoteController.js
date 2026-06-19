const NoteService = require('../services/NoteService');
const LogService = require('../services/LogService');

class NoteController {
    // Criar nota
    static async create(req, res) {
        try {
            const { title, content, category_id, color } = req.body;

            if (!title) {
                return res.status(400).json({ error: 'Título é obrigatório.' });
            }

            const note = await NoteService.createNote(req.user.id, {
                title,
                content: content || '',
                categoryId: category_id,
                color: color || '#1F2937'
            });

            await LogService.createLog({
                userId: req.user.id,
                action: 'create',
                entityType: 'note',
                entityId: note.id,
                description: `Nota "${note.title}" criada`,
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            res.status(201).json({
                message: 'Nota criada com sucesso!',
                note
            });
        } catch (error) {
            console.error('Erro ao criar nota:', error);
            res.status(500).json({ error: 'Erro ao criar nota.' });
        }
    }

    // Listar notas
    static async getAll(req, res) {
        try {
            const { 
                category_id, 
                favorite, 
                pinned,
                search,
                sort_by = 'updated_at',
                sort_order = 'DESC',
                page = 1, 
                limit = 50 
            } = req.query;

            const result = await NoteService.getUserNotes(req.user.id, {
                categoryId: category_id,
                favorite: favorite === 'true',
                pinned: pinned === 'true',
                search,
                sortBy: sort_by,
                sortOrder: sort_order,
                page: parseInt(page),
                limit: parseInt(limit)
            });

            res.json({
                notes: result.notes,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: result.total,
                    pages: Math.ceil(result.total / parseInt(limit))
                }
            });
        } catch (error) {
            console.error('Erro ao listar notas:', error);
            res.status(500).json({ error: 'Erro ao listar notas.' });
        }
    }

    // Buscar nota por ID
    static async getById(req, res) {
        try {
            const note = await NoteService.getNoteById(req.params.id, req.user.id);
            if (!note) {
                return res.status(404).json({ error: 'Nota não encontrada.' });
            }
            res.json({ note });
        } catch (error) {
            console.error('Erro ao buscar nota:', error);
            res.status(500).json({ error: 'Erro ao buscar nota.' });
        }
    }

    // Atualizar nota
    static async update(req, res) {
        try {
            const { title, content, category_id, is_favorite, is_pinned, color } = req.body;
            
            const note = await NoteService.updateNote(req.params.id, req.user.id, {
                title,
                content,
                categoryId: category_id,
                isFavorite: is_favorite,
                isPinned: is_pinned,
                color
            });

            res.json({
                message: 'Nota atualizada com sucesso!',
                note
            });
        } catch (error) {
            console.error('Erro ao atualizar nota:', error);
            res.status(500).json({ error: 'Erro ao atualizar nota.' });
        }
    }

    // Deletar nota
    static async delete(req, res) {
        try {
            const note = await NoteService.deleteNote(req.params.id, req.user.id);

            await LogService.createLog({
                userId: req.user.id,
                action: 'delete',
                entityType: 'note',
                entityId: req.params.id,
                description: `Nota "${note.title}" excluída`,
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            res.json({
                message: 'Nota excluída com sucesso!',
                note
            });
        } catch (error) {
            console.error('Erro ao deletar nota:', error);
            res.status(500).json({ error: 'Erro ao excluir nota.' });
        }
    }

    // Alternar favorito
    static async toggleFavorite(req, res) {
        try {
            const note = await NoteService.toggleFavorite(req.params.id, req.user.id);
            res.json({
                message: note.is_favorite ? 'Nota favoritada!' : 'Nota desfavoritada!',
                note
            });
        } catch (error) {
            console.error('Erro ao alternar favorito:', error);
            res.status(500).json({ error: 'Erro ao alternar favorito.' });
        }
    }

    // Fixar/Desafixar nota
    static async togglePin(req, res) {
        try {
            const note = await NoteService.togglePin(req.params.id, req.user.id);
            res.json({
                message: note.is_pinned ? 'Nota fixada!' : 'Nota desafixada!',
                note
            });
        } catch (error) {
            console.error('Erro ao alternar fixação:', error);
            res.status(500).json({ error: 'Erro ao alternar fixação.' });
        }
    }
}

module.exports = NoteController;