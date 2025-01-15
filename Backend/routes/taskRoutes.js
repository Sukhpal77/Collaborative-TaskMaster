const express = require('express');
const { createTask, getTasks, updateTask, deleteTask, shareTask } = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, createTask);
router.get('/', authMiddleware, getTasks);
router.put('/:id', authMiddleware, updateTask);
router.delete('/:id', authMiddleware, deleteTask);
router.post('/share-task', authMiddleware, shareTask);

module.exports = router;
