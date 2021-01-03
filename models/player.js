const Joi = require('joi');
Joi.ObjectId = require('joi-objectid')(Joi)
require('dotenv').config(); 
const config = require('config');
const jwt = require('jsonwebtoken');
const PasswordComplexity = require("joi-password-complexity").default;
const debug = require('debug')('modelsPlayer');
const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    }, 
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024,
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
    ],
    isAdmin: Boolean
});

playerSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'));    
    return token;
}

const Player = mongoose.model('Player', playerSchema);

function validatePlayer(player) {
    const schema = Joi.object ({
        name: Joi.string().min(2).max(20).required(),
        email: Joi.string().min(5).max(255).email().required(),
        password: new PasswordComplexity({
            min: 5,
            max: 255,
            lowerCase: 1,
            upperCase: 1,
            numeric: 1,
            symbol: 0,
            requirementCount: 0
          }).required(),
        age: Joi.number().min(5).max(110).required(),
        gender: Joi.string().min(1).max(1).required(),
        games_id: Joi.array().items(Joi.ObjectId()).required()
    })

    return schema.validate(player);
}

exports.validate = validatePlayer;
exports.Player = Player;