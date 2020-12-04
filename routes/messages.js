const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();
const moment = require('moment');
const {DATE_FORMAT} = require('../utils/constants');
const {getToken} = require('../utils/utils');

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


    const finalParams = {$or: [{...params, isPersonal: false}]};

    try {

        const token = getToken(req);

        if (token) {
            req.user = await new Promise((res, rej) => User.findByToken(token, (err, user) => {
                if (err) rej(err);
                res(user);
            }));
        }

        if (req.user) {
            await req.user.update({lastActivity: Date.now()});

            finalParams.$or.push({...params, isPersonal: true, to: req.user.name});

            if (!author || req.user.name.toLowerCase().includes(author.toLowerCase())) {
                finalParams.$or.push({...params, isPersonal: true, author: req.user.name});
            }
        }

        const pagination = {skip: +skip, limit: +top, sort: {createdAt: -1}};

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

        const message = new Message({
            text,
            isPersonal,
            to: isPersonal ? to : undefined,
            author: req.user.name,
            createdAt: Date.now()
        });
        await message.save();
        res.sendStatus(201);
    } catch (e) {
        res.status(400).send({error: e.message});
    }
});

router.put('/:id', async (req, res) => {
    const {text, isPersonal, to} = req.body;
    if (isPersonal && !to) {
        res.status(400).send({error: '"to" is missing'});
        return;
    }

    try {
        const updObj = {
            text,
            isPersonal,
            to: undefined
        };
        if (isPersonal) {
            const adressant = await User.find({name: to});
            if (!adressant) {
                res.status(400).send({error: 'unknown "to"'});
                return;
            }
            updObj.to = to;
        }

        await Message.updateOne({id: req.params.id, author: req.user.name}, updObj);
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
