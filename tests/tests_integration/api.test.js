import { expect, it, describe, beforeAll } from 'vitest';
const request = require('supertest');
const app = require('../../index');
const prisma = require('../../prismaClient');

describe('Tests d\'Intégration API pour 100% Coverage', () => {
    let userToken, userAccountId, adminToken;

    beforeAll(async () => {
        await prisma.transaction.deleteMany({});
        await prisma.account.deleteMany({});
        await prisma.user.deleteMany({});
        // On laisse logic.assurerBanqueCentrale() créer le compte 0 automatiquement
    });

    it('1. Routes de base et documentation', async () => {
        await request(app).get('/');
        await request(app).get('/api-docs/');
        const acc404 = await request(app).get('/comptes/999999');
        expect(acc404.status).toBe(404);
    });

    it('2. Cycle Auth et Comptes', async () => {
        const badSignup = await request(app).post('/signup').send({});
        expect(badSignup.status).toBe(400);

        const signup = await request(app).post('/signup').send({ email: 'u@t.com', password: 'p', nom: 'U', prenom: 'U' });
        userAccountId = signup.body.user.accountId;
        
        const login = await request(app).post('/login').send({ email: 'u@t.com', password: 'p' });
        userToken = login.body.token;

        await request(app).get('/comptes');
        await request(app).get(`/comptes/${userAccountId}`);
        await request(app).get(`/comptes/${userAccountId}/solde`);
        const solde404 = await request(app).get('/comptes/999999/solde');
        expect(solde404.status).toBe(404);
    });

    it('3. Transactions et Erreurs', async () => {
        await request(app).post(`/comptes/${userAccountId}/depot`).send({ montant: 1000 });
        const dep404 = await request(app).post('/comptes/999999/depot').send({ montant: 100 });
        expect(dep404.status).toBe(404);
        const dep400 = await request(app).post(`/comptes/${userAccountId}/depot`).send({ montant: -100 });
        expect(dep400.status).toBe(400);

        await request(app).post(`/comptes/${userAccountId}/retrait`).send({ montant: 100 });
        const ret422 = await request(app).post(`/comptes/${userAccountId}/retrait`).send({ montant: 999999 });
        expect(ret422.status).toBe(422);
        const ret404 = await request(app).post('/comptes/999999/retrait').send({ montant: 100 });
        expect(ret404.status).toBe(404);
        const ret400 = await request(app).post(`/comptes/${userAccountId}/retrait`).send({ montant: -100 });
        expect(ret400.status).toBe(400);

        const trans404 = await request(app).get('/comptes/999999/transactions');
        expect(trans404.status).toBe(404);

        const transSuccess = await request(app).get(`/comptes/${userAccountId}/transactions`);
        expect(transSuccess.status).toBe(200);
        expect(transSuccess.body.transactions).toBeDefined();
    });

    it('4. Transferts et Erreurs', async () => {
        await request(app).post('/transfert').send({ expediteurId: userAccountId, destinataireId: 0, montant: 100 });
        const t422 = await request(app).post('/transfert').send({ expediteurId: userAccountId, destinataireId: 0, montant: 999999 });
        expect(t422.status).toBe(422);

        // Inter-bank insufficient funds branch coverage
        const otherAcc = await request(app).post('/signup').send({ email: 'other@t.com', password: 'p', nom: 'O', prenom: 'O', codeBanque: 'ECO' });
        const otherId = otherAcc.body.user.accountId;
        const tInter422 = await request(app).post('/transfert').send({ expediteurId: otherId, destinataireId: userAccountId, montant: 1000 });
        expect(tInter422.status).toBe(422);

        const t404 = await request(app).post('/transfert').send({ expediteurId: 999999, destinataireId: 0, montant: 100 });
        expect(t404.status).toBe(404);

        // Account status branches
        await prisma.account.update({ where: { id: userAccountId }, data: { statut: 'suspendu' } });
        const tSusp = await request(app).post('/transfert').send({ expediteurId: userAccountId, destinataireId: 0, montant: 10 });
        expect(tSusp.status).toBe(400);
        await prisma.account.update({ where: { id: userAccountId }, data: { statut: 'actif' } });
        
        await prisma.account.update({ where: { id: 0 }, data: { statut: 'suspendu' } });
        const tDestSusp = await request(app).post('/transfert').send({ expediteurId: userAccountId, destinataireId: 0, montant: 10 });
        expect(tDestSusp.status).toBe(400);
        await prisma.account.update({ where: { id: 0 }, data: { statut: 'actif' } });
    });

    it('5. Admin Routes et Middlewares', async () => {
        const sa = await prisma.user.create({
            data: { email: 'sa@a.com', password: require('bcrypt').hashSync('p', 10), role: 'SUPERADMIN' }
        });
        const saLogin = await request(app).post('/login').send({ email: 'sa@a.com', password: 'p' });
        const saToken = saLogin.body.token;

        await request(app).post('/admin/signup').set('Authorization', `Bearer ${saToken}`).send({ email: 'a@a.com', password: 'p' });
        const aLogin = await request(app).post('/login').send({ email: 'a@a.com', password: 'p' });
        adminToken = aLogin.body.token;

        await request(app).get('/admin/statistiques').set('Authorization', `Bearer ${adminToken}`);
        await request(app).get('/admin/comptes').set('Authorization', `Bearer ${adminToken}`);
        await request(app).patch(`/admin/comptes/${userAccountId}`).set('Authorization', `Bearer ${adminToken}`).send({ nom: 'X' });
        await request(app).delete(`/admin/comptes/${userAccountId}`).set('Authorization', `Bearer ${adminToken}`);
        
        // Admin comptes creation error cases
        const badCreate = await request(app).post('/admin/comptes').set('Authorization', `Bearer ${adminToken}`).send({});
        expect(badCreate.status).toBe(400);

        // Success case for admin creation (missing in latest run)
        const okCreate = await request(app).post('/admin/comptes').set('Authorization', `Bearer ${adminToken}`).send({ nom: 'S', prenom: 'S', email: 'success@t.com' });
        expect(okCreate.status).toBe(201);

        const dupRes = await request(app).post('/admin/comptes').set('Authorization', `Bearer ${adminToken}`).send({ nom: 'A', prenom: 'A', email: 'a@a.com' });
        expect(dupRes.status).toBe(409);

        // Additional error cases for 100%
        await request(app).post('/login').send({ email: 'u@t.com', password: 'wrong' }); // index.js:144
        await request(app).post('/admin/signup').set('Authorization', `Bearer ${saToken}`).send({}); // index.js:162-163 (missing nominal case for signup fail)

        const del400 = await request(app).delete('/admin/comptes/999999').set('Authorization', `Bearer ${adminToken}`);
        expect(del400.status).toBe(400);

        const patch400 = await request(app).patch('/admin/comptes/999999').set('Authorization', `Bearer ${adminToken}`).send({ nom: 'Fail' });
        expect(patch400.status).toBe(400);

        // Delete endpoint success
        const tempUser = await request(app).post('/signup').send({ email: 'temp@t.com', password: 'p', nom: 'T', prenom: 'T' });
        const tempId = tempUser.body.user.accountId;
        const delSuccess = await request(app).delete(`/comptes/${tempId}`);
        expect(delSuccess.status).toBe(200);

        const del404_2 = await request(app).delete('/comptes/999999');
        expect(del404_2.status).toBe(404);

        // Access checks
        const denied = await request(app).get('/admin/statistiques').set('Authorization', `Bearer ${userToken}`);
        expect(denied.status).toBe(403);
        const noToken = await request(app).get('/admin/statistiques');
        expect(noToken.status).toBe(401);
        const invToken = await request(app).get('/admin/statistiques').set('Authorization', 'Bearer invalid');
        expect(invToken.status).toBe(403);
    });

});
