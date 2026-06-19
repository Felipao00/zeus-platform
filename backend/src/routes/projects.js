const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const ProjectController = require('../controllers/ProjectController');

router.use(authenticateToken);

router.post('/', ProjectController.create);
router.get('/', ProjectController.getAll);
router.get('/:id', ProjectController.getById);
router.put('/:id', ProjectController.update);
router.delete('/:id', ProjectController.delete);

module.exports = router;