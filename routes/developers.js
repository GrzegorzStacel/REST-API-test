require('dotenv').config(); 
const _ = require('lodash')
const authHandler = require('../middleware/authHandler')
const validateObjectId = require('../middleware/validateObjectId')
const admin = require('../middleware/admin')
const debug = require('debug')('routesDevelopers');
const { Developer, validate } = require('../models/developer')
const validator = require('../middleware/validate')(validate)
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

router.get('/:id', validateObjectId, async (req, res) => {
    // try {
    const developer = await Developer.findById(req.params.id);
    if(!developer) return res.status(404).send("The developer with the given ID was not found.");

    res.send(developer)
        
    // } catch (error) {
    //     res.status(404).send("The developer with the given ID was not found")
    //     debug('(GET) Show specific developer:', error.message)
    // }
})

router.post('/', [authHandler, validator], async (req, res) => {
        let developer = new Developer(_.pick(req.body, ["name", "dateOfSubmission", "country"]))

        developer = await developer.save();
        res.send(developer);
})

router.put('/:id', [authHandler, validateObjectId, validator], async (req, res) => {
    const developer = await Developer.findByIdAndUpdate(req.params.id, _.pick(req.body, ['name', 'dateOfSubmission', 'country']), { new: true });
    if(!developer) return res.status(404).send("The game with the given ID was not found.");
        
    res.send(developer)
})

router.delete('/:id', [authHandler, admin, validateObjectId], async (req, res) => {
    const developer = await Developer.findByIdAndDelete(req.params.id)
     
    if (!developer) return res.status(404).send("The Developer with the given ID was not found")
    
    res.send(developer);
})

module.exports = router;





// Manually added developers
// async function createDeveloper(name, dateOfSubmission, country) {
//     const dev = new Developer({
//         name,
//         dateOfSubmission,
//         country
//     })

//     const result = await dev.save();
//     debug(result);
// }

// createDeveloper("UbiSoft", "2003-01-20", "British")
// createDeveloper("CD Projekt", "2006-03-11", "Polish")
// createDeveloper("Piranha Bytes", "1997-05-03", "German")
// createDeveloper("Blizzard", "1989-12-21", "USA")