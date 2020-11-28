const express =require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const auth = require('./middlewares/auth');

const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const messagesRouter = require('./routes/messages');

const app = express();

app.use(logger('dev'));
app.use(cookieParser())
app.use(auth);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/messages', messagesRouter);

module.exports = app;
