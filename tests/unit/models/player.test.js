const { Player } = require('../../../models/player')
const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose')


describe('player.generateAuthToken', () => {
    it('should return a valid JWT', () => {
        const payload = { _id: new mongoose.Types.ObjectId().toHexString(), isAdmin: true };
        const player = new Player(payload);
        const token = player.generateAuthToken();
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));

        expect(decoded).toMatchObject(payload)
    })
});