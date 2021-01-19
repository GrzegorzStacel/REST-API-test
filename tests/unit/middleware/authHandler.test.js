const { Player } = require('../../../models/player');
const auth = require('../../../middleware/authHandler');
const mongoose = require('mongoose');


describe('auth middleware', () => {
    it('should populate req.player with the payload of a valid JWT', () => {
        const player = {
            _id: mongoose.Types.ObjectId().toHexString(), isAdmin: true
        };
        const token = new Player(player).generateAuthToken();
        const req = {
            header: jest.fn().mockReturnValue(token)
        };

        const res = {};
        const next = jest.fn();

        auth(req, res, next);

        expect(req.player).toMatchObject(player);
    });
});