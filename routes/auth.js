require('dotenv').config(); 
const config = require("config");
const _ = require('lodash');
const bcrypt = require('bcrypt');
const { User } = require('../models/user');
const { Player } = require('../models/player');
const debug = require('debug')('routesUsers');
const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken'); 
const router = express.Router();

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message)

    let user = await Player.findOne({ email: req.body.email })
    if(!user) return res.status(400).send('Invalid email or password.')
    
    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if(!validPassword) return res.status(400).send('Invalid email or password.')

    const token = user.generateAuthToken(); 
    res.send( token );
})

function validate(req) {
    const schema = Joi.object ({
        email: Joi.string().min(5).max(255).email().required(),
        password: Joi.string().required()
    })

    return schema.validate(req);
}

module.exports = router;