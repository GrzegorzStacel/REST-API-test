require('dotenv').config(); 
const debug = require('debug')('routesPlayers');
const { Player, validate } = require('../models/player');
const { Game } = require('../models/game');
const authHandler = require('../middleware/authHandler')
const admin = require('../middleware/admin')
const validator = require('../middleware/validate')(validate)
const _ = require('lodash');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    // throw new Error('Could not get the players')
    const players = await Player
        .find()
        .sort("name")
        .select('-_id -__v -password')
        .populate({
            path: "games_id",
            select: "-_id -__v",
            populate: {
                path: "developer_id",
                select: "-_id -__v"
            }
        })
    
    res.send(players)
    debug('(GET) Show all players')
})
        
router.get('/myAccount', authHandler, async (req, res) => {
        const player = await Player
            .findById(req.player._id)
            .select('-_id -__v -password')
            .populate({
                path: "games_id",
                select: "-_id -__v",
                populate: {
                    path: "developer_id",
                    select: "-_id -__v"
                }
            });
        res.send(player)
        debug('(GET) Show specific player')
})

router.post('/', validator, async (req, res) => {
    let player = await Player.findOne({ email: req.body.email })
    if (player) return res.status(400).send('Player already registered.')

    const gamesArray = [];
    const games = req.body.games_id;
    const missingGames = [];

    if (games.length === 0) {
        player = new Player(_.pick(req.body, ['name', 'email', 'password', 'age', 'gender', 'games_id']));

        addPlayer(player, req, res);
    } else {
        games.forEach(async (item, index) => {
            let isIdExist = await Game.findById(item)
            if (isIdExist) { gamesArray.push(isIdExist._id) }
            else {
                missingGames.push(item);
            }
                
            if (games.length - 1 === index) {
                player = new Player({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    age: req.body.age,
                    gender: req.body.gender,
                    games_id: gamesArray,
                    addInformation: missingGames
                })

                addPlayer(player, req, res);
            }
        })
    }
})

async function addPlayer(player, req, res) {
        const salt = await bcrypt.genSalt(10);
        player.password = await bcrypt.hash(player.password, salt)
        
        await player.save();
        
        const token = player.generateAuthToken();
        res.header('x-auth-token', token).send(_.pick(player, ['_id', 'name', 'email', 'age', 'gender', 'games_id']));
        
        debug('(POST) Create new player')
}

router.put('/myAccount', [authHandler, validator], async (req, res) => {
    const gamesArray = [];
    const games = req.body.games_id;
    const missingGames = [];

    if (games.length === 0) {
        const player = await Player.findByIdAndUpdate(req.player._id, _.pick(req.body, ['name', 'email', 'age', 'gender', 'games_id']), { new: true });

        res.send(player);
    } else {
        games.forEach(async (item, index) => {
            let isIdExist = await Game.findById(item)
            if (isIdExist) { gamesArray.push(isIdExist._id); }
            else {
                missingGames.push(item);
            }

            if (games.length - 1 === index) {
                const player = await Player.findByIdAndUpdate(req.player._id, {
                    name: req.body.name,
                    email: req.body.email,
                    age: req.body.age,
                    gender: req.body.gender,
                    games_id: gamesArray,
                    addInformation: missingGames
                },
                    { new: true });

                res.send(player);
            }
        })
    }
})

router.delete('/myAccount', [authHandler, admin], async (req, res) => {
    const player = await Player.findByIdAndRemove(req.player._id);
        
    res.send(player)
})

module.exports = router;


