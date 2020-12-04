const express = require('express');
const cors = require('cors');


const logger = require('morgan');
const auth = require('./middlewares/auth');

const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const messagesRouter = require('./routes/messages');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(auth);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/messages', messagesRouter);

module.exports = app;
