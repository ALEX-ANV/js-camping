const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const schema = require('../schemes/user');
const scheduler = require('../utils/schedule-activity');
const {SECRET_KEY} = require('../utils/constants');

const User = mongoose.model('User', schema);
const urlWithoutCookie = ['login', 'register'];

const auth = (req, res, next) => {
    if (!urlWithoutCookie.some(item => req.url.includes(item))) {
        return checkToken(req, res, next);
    }
    next();
}


const checkToken = (req, res, next) => {

    if (!req.cookies) {
        return res.sendStatus(401);
    }

    const {authcookie} = req.cookies;

    jwt.verify(authcookie, SECRET_KEY, async (err, data) => {
        if (err) {
            res.sendStatus(401);
        } else if (data.user) {
            const user = await User.findOne({name: data.user}).exec();
            scheduler.update(user.id);
            await user.update({isActive: true});
            next();
        }
    });
}

module.exports = auth;
