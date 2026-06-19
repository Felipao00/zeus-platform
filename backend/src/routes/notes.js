const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const NoteController = require('../controllers/NoteController');

router.use(authenticateToken);

router.post('/', NoteController.create);
router.get('/', NoteController.getAll);
router.get('/:id', NoteController.getById);
router.put('/:id', NoteController.update);
router.delete('/:id', NoteController.delete);
router.post('/:id/favorite', NoteController.toggleFavorite);
router.post('/:id/pin', NoteController.togglePin);

module.exports = router;