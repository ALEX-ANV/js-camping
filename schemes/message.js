const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageScheme = new Schema({
    id: {
        type: mongoose.Types.ObjectId,
        auto: true,
        required: true,
    },
    createdAt: {
        type: Number,
        default: Date.now()
    },
    text: {
        type: String,
        maxLength: 200,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    isPersonal: {
        type: Boolean,
        required: true,
    },
    to: String,
}, {versionKey: false});

module.exports = messageScheme;
