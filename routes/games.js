const validateObjectId = require('../middleware/validateObjectId');
const winston = require('winston');
require('dotenv').config(); 
const debug = require('debug')('routesGames');
const authHandler = require('../middleware/authHandler')
const { Game, validate } = require('../models/game');
const { Developer } = require('../models/developer');
const admin = require("../middleware/admin");
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/', async (req, res) => {
    const games = await Game
        .find()
        .select('-_id -__v')
        .populate('developer_id', 'name country -_id')
    
    res.send(games);
})

router.get('/:id', validateObjectId, async (req, res) => {
    const game = await Game
        .findById(req.params.id)
        .select('-_id -__v')
        .populate('developerInfo', 'name country -_id')
    
    if(!game) return res.status(404).send('The game with the given ID was not found.')
    
    res.send(game)
    debug('(GET) Show specific game')
})

router.post('/', authHandler, async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)
    

    let developer;

    developer = await Developer.findById(req.body.developer_id)
    debug('developer:', developer)

    let game = new Game({
        name: req.body.name,
        species: req.body.species,
        premiere: req.body.premiere,
        developer_id: {
            _id: developer._id,
            name: developer.name,
            country: developer.country
        }
    })

    game = await game.save();
    res.send(game);
})

router.put('/:id', [authHandler, validateObjectId], async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)
  
    const developer = await Developer.findById(req.body.developer_id)
    if (!developer) return res.status(404).send("The Developer with the given ID was not found")
    
    const game = await Game.findByIdAndUpdate(req.params.id,
        {
            name: req.body.name,
            species: req.body.species,
            premiere: req.body.premiere,
            developer: {
                _id: developer._id,
                country: developer.country
            }
        }, { new: true })
        
    if (!game) return res.status(404).send('The game with the given ID was not found.');
    
    res.send(game);
})

router.delete('/:id', [authHandler, admin, validateObjectId], async (req, res) => {
    const game = await Game.findByIdAndDelete(req.params.id);
    
    if(!game) return res.status(404).send("The game with the given ID was not found.");

    res.send(game);
})


module.exports = router;




// router.get('/sort/:value', async (req, res) => {
//     const games = await Game
//         .find()
//         .select('-_id -__v')
//         .populate('developerInfo', 'name country -_id')
//         .sort(req.params.value);
    
//     res.send(games);
// })




// Manually added games

// async function createGame(name, species, premiere, developerInfo) {
//     const game = new Game({
//         name,
//         species,
//         premiere,
//         developerInfo
//     })

//     const result = await game.save();
//     debug(result)
// }
// createGame("Gothic", "RPG", "2001-10-20", "5fdc9739a3e10357047fd060")
// createGame("Fifa 2016", "Sport", "2015-05-10", "5fdc67ae03e20c0948ebfe1e")
// createGame("Cyberpunk 2077", "RPG", "2020-12-08", "5fdc971c44cc385478c30f59")
// createGame("Battlefield 3", "FPS", "2010-01-14", "5fdc971c44cc385478c30f5b")
// createGame("Gothic", "RPG") // Date = default

// async function listGames() {
//     const games = await Game
//         .find()
//         .populate('developerInfo', 'name -_id')
//         .select('name premiere -_id')
//         .sort('premiere');

//     debug(games)
// }
// listGames()


// async function updateGame(gameID) {
//     const game = await Game.findById(gameID);
//     debug("before:", game.name)

//     game.name = "Gothic 1"

//     game.save();
//     debug("after:", game.name)
// }
// updateGame("5fdca157fd683e565c707885")