const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { uploadPhoto } = require('../middleware/upload');
const PhotoController = require('../controllers/PhotoController');

router.use(authenticateToken);

router.post('/upload', uploadPhoto.single('photo'), PhotoController.upload);
router.get('/', PhotoController.getAll);
router.get('/:id', PhotoController.getById);
router.put('/:id', PhotoController.update);
router.delete('/:id', PhotoController.delete);
router.post('/:id/favorite', PhotoController.toggleFavorite);

module.exports = router;