const express = require('express');
const authMiddleware = require('../middlewares/auth');
const notifications = require('./notifications');
const stats = require('./stats');

const router = express.Router();

router.use('/stats', stats);
router.use('/notifications', authMiddleware, notifications);

module.exports = router;
