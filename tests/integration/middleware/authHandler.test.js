const request = require('supertest');
const { Player } = require('../../../models/player')
const { Game } = require('../../../models/game')
const { Developer } = require('../../../models/developer')

describe('auth middleware', () => {
    beforeEach(() => { server = require('../../../app'); });
    afterEach( async () => {
        await Game.deleteMany({});
        await Developer.deleteMany({});
        await server.close();
    });

    let token;
    let developer;

    const exec = () => {
        return request(server)
            .post('/api/games')
            .set('x-auth-token', token)
            .send({
                name: 'game1',
                species: "RTS",
                developer_id: developer._id
            });
    }

    beforeEach( async () => {
        token = new Player().generateAuthToken();
        developer = new Developer({
            name: "developer1",
            dateOfSubmission: Date.now(),
            country: 'Poland'
        });
        await developer.save();
    });

    it('should return 401 if no token is provided', async () => {
        token = '';

        const res = await exec();

        expect(res.status).toBe(401);
    });
    
    it('should return 400 if token is invalid', async () => {
        token = 'a';

        const res = await exec();

        expect(res.status).toBe(400);
    });
    
    it('should return 200 if token is valid', async () => {
        const res = await exec();

        expect(res.status).toBe(200);
    });
});