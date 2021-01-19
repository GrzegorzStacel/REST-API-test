const request = require('supertest');
const { Game } = require('../../../models/game');
const { Player } = require('../../../models/player');
const { Developer } = require('../../../models/developer');
const mongoose = require('mongoose');

let server;

describe('/api/games', () => {
    beforeEach(() => { server = require('../../../app'); });
    afterEach(async () => {
        await Game.deleteMany({});
        await Developer.deleteMany({});
        await server.close();
    });

    describe('GET /', () => {
        it('should return all games', async () => {
            await Game.collection.insertMany([
                { name: 'game1' },
                { name: 'game2' },
            ])

            const res = await request(server).get('/api/games')           
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some( g => g.name === 'game1' )).toBeTruthy();
            expect(res.body.some( g => g.name === 'game2' )).toBeTruthy();
       }); 
    });

    describe('GET /:id', () => {
        it('should return a game if valid id is passed', async () => {
            const developer = new Developer({
                name: 'test1',
                dateOfSubmission: Date.now(),
                country: 'poland'
            });
            await developer.save();

            const game = new Game({
                name: 'game1',
                species: 'RTS',
                developer_id: developer._id
            });
            await game.save();

            const res = await request(server).get('/api/games/' + game._id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', game.name);
        });
        
        it('should return 404 if invalid id is passed', async () => {
            const res = await request(server).get('/api/games/1');

            expect(res.status).toBe(404);
        });

        it('should return 404 if no game with the given id exist', async () => {
            const id = mongoose.Types.ObjectId();
            const res = await request(server).get('/api/games/' + id);

            expect(res.status).toBe(404);
        });
    });

    describe('POST /', () => {

        let token;
        let name;
        let developer;

        const exec = async () => {
            return await request(server)
                .post('/api/games')
                .set('x-auth-token', token)
                .send({
                    name: name,   // name: name === name
                    species: "RTS",
                    developer_id: developer._id
                });
        }

        beforeEach(async () => {
            token = new Player().generateAuthToken();
            developer = new Developer({
                name: "developer1",
                dateOfSubmission: Date.now(),
                country: 'Poland'
            });
            await developer.save();
            name = 'game1';
        })

        it('should return 401 if client is not logged in', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });
        
        it('should return 400 if game is less than 2 characters', async () => {
            name = '1';

            const res = await exec();
            
            expect(res.status).toBe(400);
        });

        it('should return 400 if game is more than 255 characters', async () => {
            name = new Array(260).join('a');

            const res = await exec();
            
            expect(res.status).toBe(400);
        });

        it('should save the game if it is valid', async () => {
            name = 'developer1';

            await exec();
            
            let game = await Game.find({ name: 'developer1' });
            
            expect(game).not.toEqual([]);
            expect(game).not.toBeNull();
        });
        
        it('should return the game if it is valid', async () => {
            name = 'developer1';

            const res = await exec();
            
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'developer1');
            expect(res.body).toHaveProperty('species', 'RTS');
            expect(res.body).toHaveProperty('developer_id', `${developer._id}`);
        });
    });
});