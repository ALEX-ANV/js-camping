const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const {ACTIVITY_TIMEOUT} = require('../utils/constants');

const schema = require('../schemes/user');

const User = mongoose.model('User', schema);

router.get('/', async (req, res ) => {
  const users = await User.find({}, {_id: 0, pass: 0});

  res.send(users.map((user) => ({ name: user.name, isActive: user.lastActivity > Date.now() - ACTIVITY_TIMEOUT})));
});

module.exports = router;
