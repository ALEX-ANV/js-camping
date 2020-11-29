const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const schema = require('../schemes/user');
const scheduler = require('../utils/schedule-activity');
const {SECRET_KEY} = require('../utils/constants');

const User = mongoose.model('User', schema);
const urlWithoutCookie = [{url:'login', method: 'POST'}, {url: 'register', method: 'POST'}, {url: 'messages', method: 'GET'}, {url:'users', method: "GET"}];

const auth = (req, res, next) => {
    if (!urlWithoutCookie.some(item => req.url.includes(item.url) && req.method === item.method)) {
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
            const user = await User.findOneAndUpdate({name: data.user}, {isActive: true});
            scheduler.update(user.id);
            req.user = user;
            next();
        }
    });
}

module.exports = auth;
