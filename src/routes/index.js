const express = require('express');
const notifications = require('./notifications');
const stats = require('./stats');

const router = express.Router();

router.use('/stats', stats);
router.use('/notifications', notifications);

module.exports = router;
