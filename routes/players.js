require('dotenv').config(); 
const debug = require('debug')('routesPlayers');
const { Player, validate } = require('../models/player');
const { Game } = require('../models/game');
const authHandler = require('../middleware/authHandler')
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

router.post('/', async (req, res) => {
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

router.put('/myAccount', authHandler, async (req, res) => {
    debug('here')
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
                try {
                    const player = await Player.findByIdAndUpdate(req.player._id, _.pick(req.body, ['name', 'email', 'age', 'gender', 'games_id']), { new: true });
                    
                    res.send(player);
                    debug('(PUT) Update "' + player.name + '" player')
                } catch (err) {
                    // Użycie nieaktualnego tokena (playera, który został usunięty) wyrzuca błąd ale w postmanie jest kod 200 ?!?
                    debug("(PUT) Players: ", err.message)
                    // Debug powyżej odpala się ale return już nie...
                    return res.status(400).send("An unexpected error has occurred")
                }
            }
        }
        catch (error) {
            res.status(404).send("The player with the given ID was not found");
            debug('(PUT) Update player:', error)
        }
    })
})

router.delete('/myAccount', authHandler, async (req, res) => {
    try {
        const player = await Player.findByIdAndRemove(req.player._id);

        // if (!player) return res.send("Player doesn't exist")
        
        res.send(player)
        debug('(DELETE) Delete player', player)
    } catch (error) {
        res.status(404).send('The player with the given ID was not found.')
        debug('(DELETE) Delete player:', error.message)        
    }
})

module.exports = router;