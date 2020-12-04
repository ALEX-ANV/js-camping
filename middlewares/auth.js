const mongoose = require("mongoose");
const schema = require('../schemes/user');

const {getToken} = require('../utils/utils');

const User = mongoose.model('User', schema);
const urlWithoutCookie = [
    {url: 'login', method: 'POST'},
    {url: 'register', method: 'POST'},
    {url: 'messages', method: 'GET'},
    {url: 'users', method: "GET"}
    ];

const auth = (req, res, next) => {
    if (!urlWithoutCookie.some(item => req.url.includes(item.url) && req.method === item.method)) {
        return verifyToken(req, res, next);
    }
    next();
}


const verifyToken = (req, res, next) => {

    const token = getToken(req);

    if (!token) {
        return res.sendStatus(401);
    }

    User.findByToken(token, async (err, user) => {
        if (!user || err) return res.sendStatus(401);

        req.token = token;
        req.user = user;

        await req.user.update({lastActivity: Date.now()});

        next();

    })
}

module.exports = auth;
