const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const LinkController = require('../controllers/LinkController');

router.use(authenticateToken);

router.post('/', LinkController.create);
router.get('/', LinkController.getAll);
router.put('/:id', LinkController.update);
router.delete('/:id', LinkController.delete);

module.exports = router;