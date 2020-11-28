const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");

const schema = require('../schemes/user');

const User = mongoose.model('User', schema);

router.get('/', async (req, res ) => {
  const users = await User.find({}, {_id: 0, pass: 0});

  res.send(users);
});

module.exports = router;
