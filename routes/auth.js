const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const formData = require('../middlewares/formData');
const schema = require('../schemes/user');
const {ACTIVITY_TIMEOUT} = require('../utils/constants');

const User = mongoose.model('User', schema);

router.post('/register', formData, async (req, res) => {
    const {name, pass} = req.body;

    const user = new User({name, pass, lastActivity: Date.now() - ACTIVITY_TIMEOUT});

    try {
        await user.save();
        res.sendStatus(200);
    } catch (e) {
        res.status(409).send({error: e.message});
    }
});

router.post('/login', formData, async (req, res) => {

    const {name, pass} = req.body

    if (!name || !pass) {
        res.sendStatus(401);
    }

    try {
        const user = await User.findOne({name});

        if (!user) {
            return res.status(401).send({error: 'User or password is wrong'});
        }

        user.comparepassword(pass, (err, isMatch) => {
            if (err) {
                return res.status(401).send({error: err.message});
            }

            if (!isMatch) {
                return res.status(401).send({error: 'User or password is wrong'});
            }

            user.generateToken((err, user) => {
                if (err) return res.status(401).send({error: err.message});
                user.update({lastActivity: Date.now()});
                res.send({token: user.token});
            });
        });
    } catch (e) {
        res.status(401).send({error: e.message});
    }
});

router.post('/logout', async (req, res) => {
    try {
        req.user.deleteToken(req.token, (err) => {
            if (err) return res.status(401).send({error: err.message});
            res.sendStatus(200);
        });
    } catch (e) {
        res.status(401).send({error: e.message});
    }
});


module.exports = router;
