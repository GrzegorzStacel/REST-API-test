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
                    name,   // name: name === name
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

    describe('PUT /:id', () => {
        let token; 
        let newName; 
        let game; 
        let id; 
        let developer; 

        const exec = async () => {
            return await request(server)
              .put('/api/games/' + id)
              .set('x-auth-token', token)
                .send({
                    name: newName,
                    species: 'rts',
                    developer_id: developer._id
                });
          }
      
          beforeEach(async () => {
            // Before each test we need to create a game and 
            // put it in the database.      
            developer = new Developer({
                name: "developer1",
                dateOfSubmission: Date.now(),
                country: 'Poland'
            });
            await developer.save();

            game = new Game({
                name: 'game1',
                species: "RTS",
                developer_id: developer._id
            });
            await game.save();
              
            token = new Player().generateAuthToken();     
            id = game._id; 
            newName = 'updatedName'; 
          })
        
        it('should return 401 if client is not logged in', async () => {
            token = "";

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if game is less than 2 characters', async () => {
            newName = '1';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if game is more than 255 characters', async () => {
            newName = new Array(260).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 404 if id is invalid', async () => {
            id = 1;

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if game with the given id was not found', async () => {
            id = mongoose.Types.ObjectId();

            const res = await exec();
            
            expect(res.status).toBe(404);
        });

        it('should return 404 if Developer with the given id was not found', async () => {
            developer._id = mongoose.Types.ObjectId();

            const res = await exec();
            
            expect(res.status).toBe(404);
        });

        it('should update the game if input is valid', async () => {
            await exec();

            const updateGame = await Game.findById(game._id);

            expect(updateGame.name).toBe(newName);
        });

        it('should return the updated game if it is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", newName);
        });
    });

    describe('DELETE /:id', () => {
        let token;
        let game;
        let id;

        const exec = async () => {
            return await request(server)
                .delete('/api/games/' + id)
                .set('x-auth-token', token)
                .send();
        };

        beforeEach(async () => {
            // Before each test we need to create a genre and 
            // put it in the database.  

            game = new Game({
                name: 'game1',
                species: "RTS",
                developer_id: "6007459fc4ff953d8032b47f"
            });
            await game.save();
              
            id = game._id; 
            token = new Player({ isAdmin: true }).generateAuthToken();     
        })

        it('should return 401 if client is not logged in', async () => {
            token = "";

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 403 if the user is not an admin', async () => {
            token = new Player({ isAdmin: false }).generateAuthToken();

            const res = await exec();

            expect(res.status).toBe(403);
        });

        it('should return 404 if id is invalid', async () => {
            id = 1;

            const res = await exec();

            // console.log(res.error.text);

            expect(res.status).toBe(404);
        });

        it('should return 404 if no game with the given id was found', async () => {
            id = mongoose.Types.ObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should delete the genre if input is valid', async () => {
            await exec();

            const gameInDb = await Game.findById(id);

            expect(gameInDb).toBeNull();
        });

        it('should return the removed game', async () => {
            const res = await exec();
            console.log(game._id, game.name);
            expect(res.body).toHaveProperty('_id', game._id.toHexString());
            expect(res.body).toHaveProperty('name', game.name)
        });
    });
});