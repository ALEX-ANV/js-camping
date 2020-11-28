const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();
const moment = require('moment');
const {DATE_FORMAT} = require('../utils/constants');

const schema = require('../schemes/message');

const Message = mongoose.model('Message', schema);

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
            $lte: momentTo.endOf('day').valueOf()
        }
    }

    if (author) {
        params.author = author;
    }

    if (text) {
        params.text = {
            $regex: text,
            $options: "i"
        }
    }

    const pagination = {skip: +skip, limit: +top, sort: {createdAt: -1}};

    try {
        const messages = await Message.find(params, {_id: 0}, pagination).exec();

        res.send(messages);
    } catch (err) {
        res.status(400).send({error: err.message});
    }
});

router.post('/', async (req, res) => {
    const {text, isPersonal, to, author} = req.body;

    const message = new Message({text, isPersonal, to, author});

    try {
        await message.save();
        res.sendStatus(200);
    } catch (e) {
        res.status(400).send({error: e.message});
    }
});

router.put('/:id', async (req, res) => {
    try {
        await Message.findOneAndUpdate({id: req.params.id}, {...req.body}).exec();
        res.sendStatus(200);
    } catch (e) {
        res.status(400).send({error: e.message});
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Message.findOneAndDelete({id: req.params.id}).exec();
        res.sendStatus(200);
    } catch (e) {
        res.status(400).send({error: e.message});
    }
});


module.exports = router;
