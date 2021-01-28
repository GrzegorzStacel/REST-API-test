const request = require('supertest');
const { Developer } = require('../../../models/developer');
const { Player } = require('../../../models/player');
const mongoose = require('mongoose');


describe('/api/games', () => {
    beforeEach(() => { server = require('../../../app'); });
    afterEach(async () => {
        await Developer.deleteMany({});
        await server.close();
    });

    describe('GET /', () => {
        it('should return all developers', async() => {
            await Developer.collection.insertMany([
                { name: 'dev1' },
                { name: 'dev2' }
            ])    

            const res = await request(server).get('/api/developers')

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name === 'dev1')).toBeTruthy();
            expect(res.body.some(g => g.name === 'dev2')).toBeTruthy();
        });
    });
    
    describe('GET /sort/:value', () => {
        it('should return all developers in descending order of name', async() => {
            await Developer.collection.insertMany([
                { name: 'dev1' },
                { name: 'dev2' }
            ])    

            const descending = '-name';

            const res = await request(server).get('/api/developers/sort/' + descending)

            const dev1 = res.text.indexOf('dev1');
            const dev2 = res.text.indexOf('dev2');

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(dev1).toBeGreaterThan(dev2);
        });
        
        it('should return all developers in ascending order of name', async () => {
            await Developer.collection.insertMany([
                { name: 'dev1' },
                { name: 'dev2' }
            ])    

            const descending = 'name';

            const res = await request(server).get('/api/developers/sort/' + descending)

            const dev1 = res.text.indexOf('dev1');
            const dev2 = res.text.indexOf('dev2');

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(dev2).toBeGreaterThan(dev1);
        });
    });

    describe('GET /:id', () => {
        let id;

        const exec = async () => {
            return await request(server)
                .get('/api/developers/' + id)
                .send()
        };

        beforeEach(async () => {
            developer = new Developer({
                name: 'dev1',
                country: 'test',
            });
            await developer.save();

            id = developer._id;
        })

        it('should return the developer if valid id is passed', async () => {
            const res = await exec();
            
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', developer.name);
        });

        it('should return 404 if invalid id is passed', async () => {
            id = 1;

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if no game with the given id exist', async () => {
            id = mongoose.Types.ObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });
    });

    describe('POST /', () => {
        let token;
        let name;
        let developer;
        let date;

        const exec = async () => {
            return await request(server)
                .post('/api/developers')
                .set('x-auth-token', token)
                .send({
                    name,
                    dateOfSubmission: date,
                    country: 'test'
                });
        }

        beforeEach(async () => {
            token = new Player().generateAuthToken();

            developer = new Developer({
                name: "developer1",
                dateOfSubmission: date,
                country: 'test'
            });
            await developer.save();

            name = 'dev1';
            date = Date.now();
        })

        it('should return 401 if client is not logged in', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if developer is less than 2 characters', async () => {
            name = '1';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if developer is more than 255 characters', async () => {
            name = new Array(260).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return the developer if it is valid', async () => {
            name = 'developer1';

            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'developer1');
            expect(res.body).toHaveProperty('country', `${developer.country}`);
        });
    });

    describe('PUT /:id', () => {
        let token;
        let newName;
        let id;
        let developer;
        let date;

        const exec = async () => {
            return await request(server)
                .put('/api/developers/' + id)
                .set('x-auth-token', token)
                .send({
                    name: newName,
                    dateOfSubmission: date,
                    country: 'test1'
                });
        }

        beforeEach(async () => {
            token = new Player().generateAuthToken();

            developer = new Developer({
                name: "developer1",
                dateOfSubmission: date,
                country: 'test2'
            });
            await developer.save();

            id = developer._id;
            newName = 'updatedName';
            date = Date.now();
        })

        it('should return 401 if client is not logged in', async () => {
            token = "";

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if developer is less than 2 characters', async () => {
            newName = '1';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if developer is more than 255 characters', async () => {
            newName = new Array(260).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 404 if id is invalid', async () => {
            id = 1;

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if developer with the given id was not found', async () => {
            id = mongoose.Types.ObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should update the developer if input is valid', async () => {
            await exec();

            const updateGame = await Developer.findById(developer._id);

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
        let date;
        let id;

        const exec = async () => {
            return await request(server)
                .delete('/api/developers/' + id)
                .set('x-auth-token', token)
                .send();
        };

        beforeEach(async () => {
            token = new Player({ isAdmin: true }).generateAuthToken();

            developer = new Developer({
                name: "developer1",
                dateOfSubmission: date,
                country: 'test2'
            });
            await developer.save();

            id = developer._id;
            newName = 'updatedName';
            date = Date.now();
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

        it('should return 404 if id is invalid', async () => {
            id = 1;

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if no developer with the given id was found', async () => {
            id = mongoose.Types.ObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return the removed game', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id', developer._id.toHexString());
            expect(res.body).toHaveProperty('name', developer.name)
        });
    });
});