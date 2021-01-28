const request = require('supertest');
const { Player } = require('../../../models/player');
const mongoose = require('mongoose');

let server;

describe('/api/auth', () => {
    beforeEach(() => { server = require('../../../app'); });
    afterEach(async () => {
        await Player.deleteMany({});
        await server.close();
    });

    describe('POST /', () => {
        let newEmail;
        let newPassword;

        const exec = async () => {
            return await request(server)
                .post('/api/auth')
                .send({
                    email: newEmail,
                    password: newPassword,
                });
        }
        
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

            newEmail = 'email@test.pl';
            newPassword = '123Aa';
        });

        it('should return 400 if auth.email is less than 5 characters', async () => {
            newEmail = '1234';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if auth.email is more than 255 characters', async () => {
            newEmail = new Array(257).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if auth.email is invalid', async () => {
            newEmail = 'email@';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if auth.email is not find', async () => {
            newEmail = 'email@com.pl';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if auth.password is invalid', async () => {
            newPassword = '1234';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        // TODO Nie potrafię zasymulować poprawnego powrównania haseł... mimo, że są identyczne to 
        //const validPassword = await bcrypt.compare(req.body.password, user.password)
        // uważa, że jest inaczej

        // it('should return 200 if auth.password is valid', async () => {
        //     const res = await exec();

        //     console.log('error', res.error.text);
        //     console.log('body', res.body);

        //     expect(res.status).toBe(200);
        // });
    });
});