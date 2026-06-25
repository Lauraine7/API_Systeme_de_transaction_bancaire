import { expect, it, describe, beforeAll } from 'vitest';
const request = require('supertest');
const app = require('../../index');
const prisma = require('../../prismaClient');

describe('Access Control and RBAC Tests', () => {
    let userAToken, userAAccountId, userBToken, userBAccountId, adminToken;

    beforeAll(async () => {
        await prisma.transaction.deleteMany({});
        await prisma.account.deleteMany({});
        await prisma.user.deleteMany({});

        // Create User A
        const signupA = await request(app).post('/signup').send({
            email: 'userA@test.com',
            password: 'passwordA',
            nom: 'User',
            prenom: 'A'
        });
        userAAccountId = signupA.body.user.accountId;
        const loginA = await request(app).post('/login').send({ email: 'userA@test.com', password: 'passwordA' });
        userAToken = loginA.body.token;

        // Create User B
        const signupB = await request(app).post('/signup').send({
            email: 'userB@test.com',
            password: 'passwordB',
            nom: 'User',
            prenom: 'B'
        });
        userBAccountId = signupB.body.user.accountId;
        const loginB = await request(app).post('/login').send({ email: 'userB@test.com', password: 'passwordB' });
        userBToken = loginB.body.token;

        // Create Admin
        const sa = await prisma.user.create({
            data: { email: 'sa@test.com', password: require('bcrypt').hashSync('sa', 10), role: 'SUPERADMIN' }
        });
        const saLogin = await request(app).post('/login').send({ email: 'sa@test.com', password: 'sa' });
        adminToken = saLogin.body.token;
    });

    it('User A should access their own account details', async () => {
        const res = await request(app).get(`/comptes/${userAAccountId}`).set('Authorization', `Bearer ${userAToken}`);
        expect(res.status).toBe(200);
        expect(res.body.compte.id).toBe(userAAccountId);
    });

    it('User A should NOT access User B account details', async () => {
        const res = await request(app).get(`/comptes/${userBAccountId}`).set('Authorization', `Bearer ${userAToken}`);
        expect(res.status).toBe(403);
        expect(res.body.erreur).toContain('Accès refusé');
    });

    it('Admin should access User A account details', async () => {
        const res = await request(app).get(`/comptes/${userAAccountId}`).set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
    });

    it('User A should NOT see all comptes', async () => {
        const res = await request(app).get('/comptes').set('Authorization', `Bearer ${userAToken}`);
        expect(res.status).toBe(403);
    });

    it('User A should NOT delete their own account (Admin only)', async () => {
        const res = await request(app).delete(`/comptes/${userAAccountId}`).set('Authorization', `Bearer ${userAToken}`);
        expect(res.status).toBe(403);
    });

    it('User A should NOT transfer from User B account', async () => {
        const res = await request(app).post('/transfert').set('Authorization', `Bearer ${userAToken}`).send({
            expediteurId: userBAccountId,
            destinataireId: userAAccountId,
            montant: 100
        });
        expect(res.status).toBe(403);
        expect(res.body.erreur).toContain('propre compte');
    });

    it('User A can transfer from their own account', async () => {
        // First deposit some money to User A
        await prisma.account.update({ where: { id: userAAccountId }, data: { solde: 1000 } });
        
        const res = await request(app).post('/transfert').set('Authorization', `Bearer ${userAToken}`).send({
            expediteurId: userAAccountId,
            destinataireId: userBAccountId,
            montant: 100
        });
        expect(res.status).toBe(200);
    });
});
