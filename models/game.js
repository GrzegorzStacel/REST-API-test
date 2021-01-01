const Joi = require('joi');
Joi.ObjectId = require('joi-objectid')(Joi)
require('dotenv').config(); 
const debug = require('debug')('modelsGame');
const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 255
    },
    species: {
        type: String,
        required: true,
    },
    premiere: {
        type: Date,
        default: Date.now
    },
    developer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Developer'
    }
})

const Game = mongoose.model('Game', gameSchema);

function validateGame(game) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(200).required(),
        species: Joi.string().min(3).max(200).required(),
        premiere: Joi.date().required(),
        developer_id: Joi.ObjectId().required()
    });

    return schema.validate(game)
}

exports.validate = validateGame;
exports.Game = Game;