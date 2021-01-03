const Joi = require('joi');
const config = require('config');
require('dotenv').config(); 
const jwt = require('jsonwebtoken');
const PasswordComplexity = require("joi-password-complexity").default; // default musi być inaczej nie ruszy...
const debug = require('debug')('modelsUser');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
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
    isAdmin: Boolean,
    // Możemy przypisać role i operacje jakie dany użytkownik może wykonywać - zasada działania identyczna jak powyższa isAdmin
    // roles: [],
    // operations: []
});

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'));    

    return token;
}

const User = mongoose.model('User', userSchema);

function validateUser(user) {
    const schema = Joi.object ({
        name: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(5).max(255).email().required(),
        password: new PasswordComplexity({
            min: 5,
            max: 255,
            lowerCase: 1,
            upperCase: 1,
            numeric: 1,
            symbol: 0,
            requirementCount: 0
          }).required()
    })

    return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;