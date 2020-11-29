const express = require('express');
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const router = express.Router();
const moment = require('moment');
const {DATE_FORMAT} = require('../utils/constants');

const schema = require('../schemes/message');

const Message = mongoose.model('Message', schema);

const userSchema = require('../schemes/user');

const User = mongoose.model('User', userSchema);

router.get('/', async (req, res) => {

    const params = {};
    //validate query params
    const {skip, top, author, text, dateFrom, dateTo} = req.query;


    if (dateFrom) {

        const momentFrom = moment(dateFrom, DATE_FORMAT);

        if (!momentFrom.isValid()) {
            res.status(400).send({error: 'query params invalid'});
            return;
        }

        params.createdAt = {
            $gte: momentFrom.startOf('day').valueOf()
        }
    }

    if (dateTo) {

        const momentTo = moment(dateTo, DATE_FORMAT);

        if (!momentTo.isValid()) {
            res.status(400).send({error: 'query params invalid'});
            return;
        }

        if (!params.createdAt) {
            params.createdAt = {};
        }

        params.createdAt = {
            ...params.createdAt,
            $lte: momentTo.endOf('day').valueOf()
        }
    }


    if (text) {
        params.text = {
            $regex: text,
            $options: "i"
        }
    }

    if (author) {
        params.author = {
            $regex: author,
            $options: "i"
        };
    }


    const finalParams = { $or: [{...params, isPersonal: false}]};

    if (req.cookies && req.cookies.authcookie) {
        const userObj = await jwt.decode(req.cookies.authcookie);
        req.user = await User.findOne({name: userObj.user});
    }

    if (req.user) {
        finalParams.$or.push({...params, isPersonal: true, to: req.user.name});

        if(!author || req.user.name.toLowerCase().includes(author.toLowerCase())) {
            finalParams.$or.push({...params, isPersonal: true, author: req.user.name});
        }
    }

    const pagination = {skip: +skip, limit: +top, sort: {createdAt: -1}};

    try {
        const messages = await Message.find(finalParams, {_id: 0}, pagination);

        res.send(messages);
    } catch (err) {
        res.status(400).send({error: err.message});
    }
});

router.post('/', async (req, res) => {
    const {text, isPersonal, to} = req.body;
    if (isPersonal && !to) {
        res.status(400).send({error: '"to" is missing'});
        return;
    }

    try {
        if (isPersonal) {
            const adressant = await User.find({name: to});
            if (!adressant) {
                res.status(400).send({error: 'unknown "to"'});
                return;
            }
        }

        const message = new Message({text, isPersonal, to, author: req.user.name});
        await message.save();
        res.sendStatus(201);
    } catch (e) {
        res.status(400).send({error: e.message});
    }
});

router.put('/:id', async (req, res) => {
    const {isPersonal, to} = req.body;
    if (isPersonal && !to) {
        res.status(400).send({error: '"to" is missing'});
        return;
    }

    try {
        if (isPersonal) {
            const adressant = await User.find({name: to});
            if (!adressant) {
                res.status(400).send({error: 'unknown "to"'});
                return;
            }
        }

        if (isPersonal === 'false') {
            req.body.to = undefined;
        }

        await Message.updateOne({id: req.params.id, author: req.user.name}, {...req.body});
        res.sendStatus(200);
    } catch (e) {
        res.status(400).send({error: e.message});
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Message.deleteOne({id: req.params.id, author: req.user.name});
        res.sendStatus(200);
    } catch (e) {
        res.status(400).send({error: e.message});
    }
});


module.exports = router;
