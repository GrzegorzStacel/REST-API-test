require('dotenv').config(); 
const auth = require('../middleware/auth')
const debug = require('debug')('routesDevelopers');
const { Developer, validate } = require('../models/developer')
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const developer = await Developer
        .find()
        .select('-_id -__v')
    
    res.send(developer);
})

router.get('/sort/:value', async (req, res) => {
    const developer = await Developer
        .find()
        .select('-_id -__v')
        .sort(req.params.value)
    
    res.send(developer);
})

router.get('/:id', async (req, res) => {
    try {
        const developer = await Developer.findById(req.params.id);
        res.send(developer)
        debug('(GET) Show specific developer')
        
    } catch (error) {
        res.status(404).send("The developer with the given ID was not found")
        debug('(GET) Show specific developer:', error.message)
    }
})

// router.post('/', auth, async (req, res) => {
router.post('/', async (req, res) => {
    const { error } = validate(req.body)
    if (error) {
        debug("(POST) validate:", error.message)
        return res.status(400).send(error.details[0].message)
    }
    try {
        let developer = new Developer({
            name: req.body.name,
            dateOfSubmission: req.body.dateOfSubmission,
            country: req.body.country,
            developer_id: req.body.developer_id
        })

        developer = await developer.save();
        res.send(developer);

    } catch (error) {
        debug("(POST) save:", error.message)
    }
})

router.put('/:id', async (req, res) => {
    const { error } = validate(req.body)
    if (error) {
        debug("(PUT) validate:", error.message)
        return res.status(400).send(error.details[0].message)
    }

    try {
        const developer = await Developer.findByIdAndUpdate(req.params.id,
            {
                name: req.body.name,
                dateOfSubmission: req.body.dateOfSubmission,
                country: req.body.contry
            }, { new: true });
        
        res.send(developer)
    } catch (error) {
        debug("(PUT) findByIdAndUpdate:", error.message)
        res.status(400).send("The Developer with the given ID was not found")
    }
})

router.delete('/:id', async (req, res) => {
    const { error } = validate(req.body)
    if (error) {
        debug("(DELETE) validate:", error.message)
        return res.status(400).send(error.details[0].message)
    }

    try {
        const developer = await Developer.findByIdAndDelete(req.params.id)
     
        res.send(developer)
    } catch (error) {
        debug("(DELETE) findByIdAndDelete:", error.message)
        res.status(400).send("The Developer with the given ID was not found")
    }
})


module.exports = router;





// Manually added developers
async function createDeveloper(name, dateOfSubmission, country) {
    const dev = new Developer({
        name,
        dateOfSubmission,
        country
    })

    const result = await dev.save();
    debug(result);
}

// createDeveloper("UbiSoft", "2003-01-20", "British")
// createDeveloper("CD Projekt", "2006-03-11", "Polish")
// createDeveloper("Piranha Bytes", "1997-05-03", "German")
// createDeveloper("Blizzard", "1989-12-21", "USA")