const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { queue } = req.app.locals;
    res.send(await queue.stat());
  } catch (err) {
    res.sendStatus(500);
  }
});

module.exports = router;
