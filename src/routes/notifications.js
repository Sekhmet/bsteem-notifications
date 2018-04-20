const express = require('express');
const validTokenMiddleware = require('../middlewares/validToken');
const { Token } = require('../models');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('listing notifications.');
});

router.get('/register', validTokenMiddleware, async (req, res) => {
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

router.get('/unregister', validTokenMiddleware, async (req, res) => {
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
