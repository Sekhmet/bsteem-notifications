const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('listing notifications.');
});

router.get('/register', (req, res) => {
  res.send('registering new device.');
});

router.get('/unregister', (req, res) => {
  res.send('unregistering device.');
});

module.exports = router;
