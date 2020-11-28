const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userScheme = new Schema({
    name: {
        type: String,
        unique: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    pass: String
}, {versionKey: false});

module.exports = userScheme;
