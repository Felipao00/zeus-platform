const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const VaultController = require('../controllers/VaultController');

router.use(authenticateToken);

router.post('/', VaultController.create);
router.get('/', VaultController.getAll);
router.post('/:id/view', VaultController.view);
router.put('/:id', VaultController.update);
router.delete('/:id', VaultController.delete);

module.exports = router;