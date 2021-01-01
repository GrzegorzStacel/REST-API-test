require('dotenv').config(); 
const debug = require('debug')('routesGames');
const auth = require('../middleware/auth')
const { Game, validate } = require('../models/game');
const { Developer } = require('../models/developer')
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const games = await Game
        .find()
        .select('-_id -__v')
        .populate('developer_id', 'name country -_id')
    
    res.send(games);
})

router.get('/sort/:value', async (req, res) => {
    const games = await Game
        .find()
        .select('-_id -__v')
        .populate('developerInfo', 'name country -_id')
        .sort(req.params.value);
    
    res.send(games);
})

router.get('/:id', async (req, res) => {
    try {
        const game = await Game
            .findById(req.params.id)
            .select('-_id -__v')
            .populate('developerInfo', 'name country -_id')
        res.send(game)
        debug('(GET) Show specific game')
        
    } catch (error) {
        res.status(404).send("The game with the given ID was not found")
        debug('(GET) Show specific game:', error.message)
    }
})

router.post('/', auth, async (req, res) => {
    const { error } = validate(req.body)
    if (error) {
        debug("(POST) validate:", error.message)
        return res.status(400).send(error.details[0].message)
    }
    debug("post developer id:", req.body.developer_id)

    let developer;
    try {
        developer = await Developer.findById(req.body.developer_id)
        debug('developer:', developer)
    } catch (err) {
        res.status(400).send("The Developer with the given ID was not found")
        debug("(POST) developerID:", err.message)  
    }

    try {
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

    } catch (error) {
        debug("(POST) save:", error.message)
    }
})

router.put('/:id', async (req, res) => {
    const { error } = validate(req.body)
    if (error) {
        debug("(PUT)", error.message)
        return res.status(400).send(error.details[0].message)
    }

    let developer;
    try {
        developer = await Developer.findById(req.body.developerID)
    } catch (err) {
        res.status(400).send("The Developer with the given ID was not found")
        debug("(PUT) developerID:", err.message)  
    }

    try {
        
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
        
        res.send(game);
    } catch (error) {
        res.status(404).send('The game with the given ID was not found.');
        debug("(PUT) findByIdAndUpdate:", error.message)
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const gameToRemove = await Game.findById(req.params.id)
        const game = await Game.findByIdAndDelete(req.params.id);
        debug('(DELETE) The proces is complete:', gameToRemove.name, "- was deleted")
        res.send(game);
    } catch (error) {        
        debug('(DELETE) findByIdAndDelete', error.message)
        res.status(404).send("The game with the given ID was not found.");
    }
})


module.exports = router;









// Manually added games

async function createGame(name, species, premiere, developerInfo) {
    const game = new Game({
        name,
        species,
        premiere,
        developerInfo
    })

    const result = await game.save();
    debug(result)
}
// createGame("Gothic", "RPG", "2001-10-20", "5fdc9739a3e10357047fd060")
// createGame("Fifa 2016", "Sport", "2015-05-10", "5fdc67ae03e20c0948ebfe1e")
// createGame("Cyberpunk 2077", "RPG", "2020-12-08", "5fdc971c44cc385478c30f59")
// createGame("Battlefield 3", "FPS", "2010-01-14", "5fdc971c44cc385478c30f5b")
// createGame("Gothic", "RPG") // Date = default

async function listGames() {
    const games = await Game
        .find()
        .populate('developerInfo', 'name -_id')
        .select('name premiere -_id')
        .sort('premiere');

    debug(games)
}
// listGames()


async function updateGame(gameID) {
    const game = await Game.findById(gameID);
    debug("before:", game.name)

    game.name = "Gothic 1"

    game.save();
    debug("after:", game.name)
}
// updateGame("5fdca157fd683e565c707885")