const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const {BCRYPT_SALT, SECRET_KEY} = require('../utils/constants');

const Schema = mongoose.Schema;

const userScheme = new Schema({
    name: {
        type: String,
        unique: true
    },
    lastActivity: {
        type: Number,
        default: Number.MIN_SAFE_INTEGER
    },
    pass: String,
    token: String
}, {versionKey: false});

userScheme.pre('save', function (next) {
    const user = this;

    if (user.isModified('pass')) {
        bcrypt.genSalt(BCRYPT_SALT, function (err, salt) {
            if (err) return next(err);

            bcrypt.hash(user.pass, salt, function (err, hash) {
                if (err) return next(err);
                user.pass = hash;
                next();
            })

        })
    } else {
        next();
    }
});

userScheme.methods.comparepassword = function (pass, cb) {
    bcrypt.compare(pass, this.pass, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
}

userScheme.methods.generateToken = function (cb) {
    const user = this;
    const token = jwt.sign(user._id.toHexString(), SECRET_KEY);

    user.token = token;
    user.save(function (err, user) {
        if (err) return cb(err);
        cb(null, user);
    })
}

userScheme.statics.findByToken = function (token, cb) {
    const user = this;

    jwt.verify(token, SECRET_KEY, function (err, decode) {
        user.findOne({"_id": decode, "token": token}, function (err, user) {
            if (err) return cb(err);
            cb(null, user);
        })
    })
};

userScheme.methods.deleteToken = function (token, cb) {
    const user = this;

    user.update({$unset: {token: 1}}, function (err, user) {
        if (err) return cb(err);
        cb(null, user);
    })
}

module.exports = userScheme;
