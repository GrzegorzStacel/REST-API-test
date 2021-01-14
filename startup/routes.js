const express = require('express');
const players = require('../routes/players');
const games = require('../routes/games');
const developers = require('../routes/developers');
const users = require('../routes/users');
const auth = require('../routes/auth');
const error = require("../middleware/error");

module.exports = function (app) {
    app.use(express.json());
    app.use('/api/players', players);
    app.use('/api/games', games);
    app.use('/api/developers', developers);
    app.use('/api/users', users);
    app.use('/api/auth', auth);
    app.use(error)
}