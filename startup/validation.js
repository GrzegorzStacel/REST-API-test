const Joi = require('joi');

module.exports = function () {
    Joi.obiectId = require('joi-objectid')(Joi);
}