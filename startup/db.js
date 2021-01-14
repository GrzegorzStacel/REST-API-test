const winston = require('winston');
const mongoose = require('mongoose');
require('dotenv').config();
const config = require("config");

module.exports = function () {
    mongoose.connect(config.get('db'), {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true
    })
        .then(() => winston.info({
            level: 'info',
            message: 'Connected to MongoDB...'
        }))
}