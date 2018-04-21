const express = require('express');
const validTokenMiddleware = require('../middlewares/validToken');
const { Notification, Token } = require('../models');

const router = express.Router();

router.get('/', async (req, res) => {
  const limit = Math.min(req.query.limit || 50, 200);
  const start = req.query.start;

  let query = {
    owner: req.user.name,
  };

  if (start) {
    query = Object.assign({}, query, {
      _id: { $gt: start },
    });
  }

  const notifications = await Notification.find(query).limit(limit);
  res.send(notifications);
});

router.post('/register', validTokenMiddleware, async (req, res) => {
  try {
    await Token.create({
      owner: req.user.name,
      value: req.expoToken,
    });

    return res.send({
      message: 'registered',
    });
  } catch (err) {
    return res.sendStatus(500);
  }
});

router.post('/unregister', validTokenMiddleware, async (req, res) => {
  try {
    await Token.remove({ value: req.expoToken });

    return res.send({
      message: 'unregistered',
    });
  } catch (err) {
    return res.sendStatus(500);
  }
});

module.exports = router;
