const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const formData = require('../middlewares/formData');
const schema = require('../schemes/user');
const {SECRET_KEY} = require('../utils/constants');

const User = mongoose.model('User', schema);

router.post('/register', formData, async (req, res) => {
    const {name, pass} = req.body;

    console.log(name, pass)

    const user = new User({name, pass});

    try {
        await user.save();
        res.sendStatus(200);
    } catch (e) {
        res.status(409).send({error: e.message});
    }
});

router.post('/login', formData, (req, res) => {

    const {name, pass} = req.body

    if (!name || !pass) {
        res.sendStatus(401);
    }

    const token = jwt.sign({user: name, pass}, SECRET_KEY)

    res.cookie('authcookie', token, {maxAge: 900000, httpOnly: true})

    res.sendStatus(200);
});

router.post('/logout', async (req, res) => {
    const {name} = req.body;

    try {
        const user = await User.findOne({name}).exec();
        if (user) {
            return res.clearCookie('authcookie').sendStatus(200);
        }
        res.status(401).send({error: 'User not found'});
    } catch (e) {
        res.status(401).send({error: e.message});
    }
});


module.exports = router;
