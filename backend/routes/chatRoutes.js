const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, chatController.getOrCreateChat);

module.exports = router;