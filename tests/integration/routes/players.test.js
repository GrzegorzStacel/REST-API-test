const request = require('supertest');
const { Player } = require('../../../models/player');
const { Game } = require('../../../models/game');
const player = require('../../../routes/players');
const mongoose = require('mongoose');
const { isNull } = require('lodash');

describe('/api/players', () => {
    let server;

    beforeEach(() => { server = require('../../../app') });
    afterEach(async () => {
        await Player.deleteMany({});
        await Game.deleteMany({});
        await server.close();
    })

    describe('GET /', () => {
        it('should return all players', async () => {
            await Player.collection.insertMany([
                { name: 'player1', email: 'email1' },
                { name: 'player2', email: 'email2' }
            ])

            const res = await request(server).get('/api/players');

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some( p => p.name === 'player1' )).toBeTruthy();
            expect(res.body.some( p => p.name === 'player2' )).toBeTruthy();
        });
    });

    describe('GET /myAccount', () => {
        let player;
        let token;

        const exec = async () => {
            return await request(server)
                .get('/api/players/myAccount')
                .set('x-auth-token', token)
                .send()
        }

        beforeEach(async () => {
            player = new Player({
                name: 'player1',
                email: 'email',
                gender: 'M',
                age: 30,
                password: '12345'
            })
            await player.save();

            token = player.generateAuthToken();
        })

        it('should return a player if valid is passed', async () => {
            const res = await exec();
            
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', player.name);
        });

        it('should return 401 if client is not logged in', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });
        
        it('should return 400 if token is invalid', async () => {
            token = '1';

            const res = await exec();

            expect(res.status).toBe(400);
        });
    });

    describe('POST /', () => {
        let game;
        let developerId = mongoose.Types.ObjectId();
        let name;
        let email;
        let age;
        let gender;
        let password;
        let games_id;

        const exec = async () => {
            return await request(server)
                .post('/api/players')
                .send({
                    name,
                    email,
                    age,
                    gender,
                    password,
                    games_id
                });
        };

        beforeEach(async () => {
            game = new Game({
                name: 'game1',
                species: 'RTS',
                developer_id: developerId
            });
            await game.save();

            name = 'player1';
            email = 'email@g.com';
            age = 20;
            gender = 'M';
            password = '123Aa';
            games_id = [game._id];
        });

        it('should return 400 if player.name is a null', async () => {
            name = null;

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if player.name is a boolean(true)', async () => {
            name = true;

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if player.name is a number', async () => {
            name = 1;

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if player.name is an empty string', async () => {
            name = '';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if player.name is less than 2 characters', async () => {
            name = '1';

            const res = await exec();
            
            expect(res.status).toBe(400);
        });

        it('should return 400 if player.name is more than 40 characters', async () => {
            // 41 is pass - I think because it is written from 0
            // Array(42) = name.length = 41
            name = new Array(42).join('a');

            const res = await exec();
            
            expect(res.status).toBe(400);
        });

        it('should return 400 if player.email is a null', async () => {
            email = null;

            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.email is a number', async () => {
            email = 1;
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.email is a boolean(true)', async () => {
            email = true;
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.email is a empty', async () => {
            email = '';
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.email is invalid', async () => {
            email = 'email';
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.age is a string', async () => {
            age = 'a';
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.age is a boolean(true)', async () => {
            age = true;
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.age is a null', async () => {
            age = null;
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.age is a NaN', async () => {
            age = NaN;
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.age is less than 5 characters', async () => {
            age = 4;
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.age is more than 110 characters', async () => {
            age = 111;
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.gender is a number', async () => {
            gender = 1;
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.gender is a NaN', async () => {
            gender = NaN;
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.gender is a null', async () => {
            gender = null;
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.gender is an empty', async () => {
            gender = '';
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.gender is more than 1 characters', async () => {
            gender = '12';
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.password don`t have at least 1 lower-cased letter', async () => {
            password = '1234A';
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.password don`t have at least 1 upper-cased letter', async () => {
            password = '1234a';
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.password is an empty', async () => {
            password = '';
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.password is a null', async () => {
            password = null;
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.password is a NaN', async () => {
            password = NaN;
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.password is a number', async () => {
            password = 1;
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.password is less than 5 characters', async () => {
            password = "12Aa";
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.password is more than 1024 characters', async () => {
            password = "12Aa" + new Array(1022).join('a');
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.games_id is a string', async () => {
            games_id = "a";
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.games_id is a number', async () => {
            games_id = 1;
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.games_id is a NaN', async () => {
            games_id = NaN;
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.games_id is a null', async () => {
            games_id = null;
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.games_id is a undefinded', async () => {
            games_id = undefined;
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        
        it('should return 400 if player.games_id is an array with invalid id', async () => {
            games_id = ['a'];
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });

        it('should return 400 if player.games_id is an array with number', async () => {
            games_id = [1];
            
            const res = await exec();
            
            expect(res.status).toBe(400);
        });

        it('should return 200 if player.game_id not exist', async () => {
            games_id.push( mongoose.Types.ObjectId() )

            const res = await exec();

            expect(res.status).toBe(200);
        });

        it('should return 200 if player is valid', async () => {
            const res = await exec();
            
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'player1');
            expect(res.body).toHaveProperty('age', 20);
            expect(res.body).toHaveProperty('gender', 'M');
            expect(res.body).toHaveProperty('games_id', [game._id.toHexString()]);
        });
        
        it('should return 400 if player is already registered', async () => {
            const NewPlayer = new Player({
                name,
                email,
                age,
                gender,
                password,
                games_id
            })
            await NewPlayer.save();
            
            const res = await exec();

            let isRegistered = await Player.findOne({ email: 'email@g.com' });
            
            expect(res.status).toBe(400);
            expect(isRegistered).not.toBeNull();
        });
        
        it('should return 200 if array in player.games_id is empty', async () => {
            games_id = [];
            
            const res = await exec();

            expect(res.status).toBe(200);
        }); 
        
        it('should return 200 if player.games_id contain not existing ID of game', async () => {
            notExistingGame = mongoose.Types.ObjectId();
            games_id.push(notExistingGame);

            const res = await exec();

            expect(res.body).toHaveProperty('name', 'player1')
        });
    });

    describe('PUT /myAccount', () => {
        let token;
        let developerId = mongoose.Types.ObjectId();
        let newName;
        let player;
        let game;
        let gameId;

        const exec = async () => {
            return await request(server)
                .put('/api/players/myAccount')
                .set('x-auth-token', token)
                .send({
                    name: newName,
                    email: 'email@test.pl',
                    age: 20,
                    gender: "M",
                    password: "123Aa",
                    games_id: gameId
                })
        }

        beforeEach(async () => {
            game = new Game({
                name: 'game1',
                species: 'RTS',
                developer_id: developerId
            });
            await game.save();
            
            player = new Player({
                name: 'player1',
                email: 'email@test.pl',
                age: 20,
                gender: "M",
                password: "123Aa",
                games_id: gameId
            });
            await player.save();

            token = new Player(player).generateAuthToken();
 
            newName = 'updatedName';
            gameId = [game._id]
        });

        it('should return 401 if client is not logged in', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 is less than 2 characters', async () => {
            newName = '1'

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if player.name is more than 40 characters', async () => {
            newName = new Array(42).join('a');
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if player.name is more than 40 characters', async () => {
            newName = new Array(42).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 200 if player.game_id is empty array', async () => {
            gameId = []

            const res = await exec();

            expect(res.status).toBe(200);
        });

        it('should return 200 if player.game_id have more than 1 ID object', async () => {
            game1 = new Game({
                name: 'game2',
                species: 'RTS',
                developer_id: developerId
            });
            await game1.save();
            
            gameId.push(game1._id)

            const res = await exec();

            expect(res.status).toBe(200);
        });
        
        it('should return 200 if player.game_id not exist', async () => {
            gameId.push( mongoose.Types.ObjectId() )

            const res = await exec();

            expect(res.status).toBe(200);
        });
    });

    describe('DELETE /myAccount', () => {
        let token;
        let player;
        
        const exec = async () => {
            return await request(server)
            .delete('/api/players/myAccount')
            .set('x-auth-token', token)
            .send();
        };
        
        beforeEach(async () => {
            player = new Player({
                name: 'player1',
                email: 'email@test.pl',
                age: 20,
                gender: "M",
                password: "123Aa",
                games_id: [],
                isAdmin: true
            });
            await player.save();
            
            token = player.generateAuthToken();
        })

        it('should return 401 if client is not logged in', async () => {
            token = "";

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 403 if the player is not an admin', async () => {
            token = new Player({ isAdmin: false }).generateAuthToken();

            const res = await exec();

            expect(res.status).toBe(403);
        });

        it('should delete the player if input is valid', async () => {
            await exec();
            
            const isDelete = await Player.findById(player._id);

            expect(isDelete).toBeNull();
        });
    });
});