const Joi = require('joi');
Joi.ObjectId = require('joi-objectid')(Joi)
require('dotenv').config(); 
const debug = require('debug')('modelsPlayer');
const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 20
    },
    age: {
        type: Number,
        required: true,
        min: 5,
        max: 110
    },
    gender: {
        type: String,
        required: true,
        min: 1,
        max: 1
    },
    games_id: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Game"
        }
    ]
});

const Player = mongoose.model('Player', playerSchema);

function validatePlayer(player) {
    const schema = Joi.object ({
        name: Joi.string().min(2).max(20).required(),
        age: Joi.number().min(5).max(110).required(),
        gender: Joi.string().min(1).max(1).required(),
        games_id: Joi.array().items(Joi.ObjectId()).required()
    })

    return schema.validate(player);
}

exports.validate = validatePlayer;
exports.Player = Player;