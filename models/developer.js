const Joi = require('joi');
require('dotenv').config(); 
const debug = require('debug')('modelsDeveloper');
const mongoose = require('mongoose');

const developerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 255,
        trim: true
    },
    dateOfSubmission: {
        type: Date,
        required: true,
        default: Date.now
    },
    country: {
        type: String,
        required: true
    }
})

const Developer = mongoose.model('Developer', developerSchema);

function validateDeveloper(developer) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(200).required(),
        dateOfSubmission: Joi.date().required(),
        country: Joi.string().required()
    });

    return schema.validate(developer)
}

exports.Developer = Developer;
exports.validate = validateDeveloper;