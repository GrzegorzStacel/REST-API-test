const winston = require('winston');
const mongoose = require('mongoose');
require('dotenv').config();
const config = require("config");

module.exports = function () {
    const db = config.get('db');
    mongoose.connect(db, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true
    })
        .then(() => winston.info({
            level: 'info',
            message: `Connected to ${db}...`
        }))
}