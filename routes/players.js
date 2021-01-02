require('dotenv').config(); 
const config = require('config');
const debug = require('debug')('routesPlayers');
const { Player, validate } = require('../models/player');
const { Game } = require('../models/game');
const auth = require('../middleware/auth')
const _ = require('lodash');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
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

router.get('/:id', async (req, res) => {
    try {
        const player = await Player
            .findById(req.params.id)
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
        
    } catch (error) {
        res.status(404).send("The player with the given ID was not found")
        debug('(GET) Show specific player:', error.message)
    }
})

router.post('/', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message)

    let player = await Player.findOne({ email: req.body.email })
    if (player) return res.status(400).send('Player already registered.')

    const gamesArray = [];
    const games = req.body.games_id;

    games.forEach( async (item, index) => { 
        try {
            let isIdExist = await Game.findById(item)
            if (isIdExist) {
                gamesArray.push(isIdExist._id)
            } else {
                res.status(404).send("The game with the given ID: '" + games + "' was not found")
                debug("The game with the given ID: '" + games + "' was not found")
            }
            
            if (games.length === gamesArray.length) {
                player = new Player(_.pick(req.body, ['name', 'email', 'password', 'age', 'gender', 'games_id']));

                const salt = await bcrypt.genSalt(10); 
                player.password = await bcrypt.hash(player.password, salt)

                await player.save();

                const token = player.generateAuthToken(); 
                res.header('x-auth-token', token).send( _.pick(player, ['_id', 'name', 'email', 'age', 'gender', 'games_id']));
                
                debug('(POST) Create new player')
            }
        } catch (error) {
            debug("Error:",  error.message)
            res.status(404).send("The game with the given ID was not found")
        }
    })
})

router.put('/:id', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);


    const gamesArray = [];
    const games = req.body.games_id;

    games.forEach(async (item, index) => {
        try {
            try {
                let isIdExist = await Game.findById(item)
                if (isIdExist) gamesArray.push(isIdExist._id)
            } catch (error) {
                res.status(404).send("The game with the given ID was not found");
            }

            if (games.length === gamesArray.length) {
                const player = await Player.findByIdAndUpdate(req.params.id, _.pick(req.body, ['name', 'email', 'age', 'gender', 'games_id']), { new: true });

                res.send(player);
                debug('(PUT) Update "' + player.name + '" player')
            }
        }
        catch (error) {
            res.status(404).send("The player with the given ID was not found");
            debug('(PUT) Update player:', error)
        }
    })
})

router.delete('/:id', auth, async (req, res) => {
    try {
        const player = await Player.findByIdAndRemove(req.params.id);

        res.send(player)
        debug('(DELETE) Delete player', player)
    } catch (error) {
        res.status(404).send('The player with the given ID was not found.')
        debug('(DELETE) Delete player:', error.message)        
    }
})

module.exports = router;