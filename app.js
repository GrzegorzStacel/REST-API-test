require('dotenv').config();
const config = require("config");
const debug = require('debug')('App');
const Joi = require('joi');
Joi.obiectId = require('joi-objectid')(Joi);
const players = require('./routes/players');
const games = require('./routes/games');
const developers = require('./routes/developers');
const users = require('./routes/users');
const auth = require('./routes/auth');
const mongoose = require('mongoose');
const express = require('express');
const app = express();

if (!config.get('jwtPrivateKey')) {
    console.error('FATAL ERROR: jwtPrivateKey is not defined.');
    process.exit(1);
}

const mongoDB = "mongodb://localhost/testing";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true})
    .then(() => debug('Connected to MongoDB...'))
    .catch((err) => debug('Could not connect to MongoDB...', err))
   
app.use(express.json());
app.use('/api/players', players);
app.use('/api/games', games);
app.use('/api/developers', developers);
app.use('/api/users', users);
app.use('/api/auth', auth);


// Configuration
// debug('Application Name: ' + config.get('name'));
// debug('Mail server: ' + config.get('mail.host'));
// debug('mail password: ' + config.get('mail.password'));


const port = process.env.PORT || 3000;
app.listen(port, () => debug(`Listening on port ${port}...`));