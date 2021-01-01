require('dotenv').config(); 
const debug = require('debug')('routesPlayers');
const { Player, validate } = require('../models/player')
const { Game } = require('../models/game')
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const players = await Player
        .find()
        .sort("name")
        .select('-_id -__v')
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
            .select('-_id -__v')
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

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message)

    const user = await Player.findOne({ name: req.body.name })
    if (user) return res.status(400).send('User already exists')

    const gamesArray = [];
    const games = req.body.games_id;

    games.forEach( async (item, index) => { 
        try {

            let isIdExist = await Game.findById(item)
            if (isIdExist) gamesArray.push(isIdExist._id)

            if (games.length === gamesArray.length) {
                
                let player = new Player({
                    name: req.body.name,
                    age: req.body.age,
                    gender: req.body.gender,
                    games_id: gamesArray
                })

                player = await player.save();
                res.send(player);
                debug('(POST) Create new player')
            }
        } catch (error) {
            debug(error.message)
            res.status(404).send("The game with the given ID was not found")
        }
    })
})

router.put('/:id', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);


    const gamesArray = [];
    const games = req.body.games_id;

    games.forEach(async (item, index) => {
        try {
            try {
                // catch działa tylko jeśli jest za mało lub za dużo znaków w stringu z ID
                // Jeżeli tylko zmienimy jakiś znak postman się kręci jakby ciągle coś szukał bez wyrzucenia  błędu
                let isIdExist = await Game.findById(item)
                if (isIdExist) gamesArray.push(isIdExist._id)
            } catch (error) {
                res.status(404).send("The game with the given ID was not found");
            }

            if (games.length === gamesArray.length) {
                const player = await Player.findByIdAndUpdate(req.params.id, {
                    name: req.body.name,
                    age: req.body.age,
                    gender: req.body.gender,
                    games_id: gamesArray
                }, { new: true });

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

router.delete('/:id', async (req, res) => {
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