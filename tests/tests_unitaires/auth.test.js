import { expect, it, describe, beforeAll } from 'vitest';
const auth = require('../../auth');
const prisma = require('../../prismaClient');

describe('Tests du Module Authentification (Unit)', () => {

    beforeAll(async () => {
        // Nettoyage des tests précédents
        await prisma.transaction.deleteMany({});
        await prisma.account.deleteMany({});
        await prisma.user.deleteMany({});
    });

    it('doit échouer si un compte avec cet email existe déjà (sans user)', async () => {
        // Simuler un cas où le compte existe mais pas le user (rare mais possible via logic.creerCompte directement)
        await prisma.account.create({ data: { email: 'exists@compte.com', nom: 'A', prenom: 'B', typeCompte: 'courant', codeBanque: 'UBA' } });
        await expect(auth.signup({ email: 'exists@compte.com', password: 'p', nom: 'A', prenom: 'B' })).rejects.toThrow('Un compte avec cet email existe déjà');
    });

    it('doit créer un utilisateur et un compte lors du signup', async () => {
        const userData = {
            email: `test.${Date.now()}@example.com`,
            password: 'password123',
            nom: 'Test',
            prenom: 'User',
            typeCompte: 'courant',
            codeBanque: 'UBA'
        };

        const user = await auth.signup(userData);

        expect(user).toBeDefined();
        expect(user.email).toBe(userData.email);
        expect(user.role).toBe('USER');
        expect(user.account).toBeDefined();
        expect(user.account.nom).toBe('Test');
    });

    it('doit échouer si des champs obligatoires sont manquants', async () => {
        const userData = { email: 'incomplete@test.com', password: 'password123' };
        await expect(auth.signup(userData)).rejects.toThrow('email, password, nom et prenom sont obligatoires pour l\'inscription');
    });

    it('doit échouer si l\'email est déjà utilisé', async () => {
        const email = `duplicate.${Date.now()}@example.com`;
        const userData = {
            email,
            password: 'password123',
            nom: 'Test',
            prenom: 'User'
        };

        await auth.signup(userData);
        
        await expect(auth.signup(userData)).rejects.toThrow('Cet email est déjà utilisé');
    });

    it('doit connecter un utilisateur avec les bons identifiants', async () => {
        const email = `login.${Date.now()}@example.com`;
        const password = 'secretpassword';
        
        await auth.signup({
            email,
            password,
            nom: 'Login',
            prenom: 'Test'
        });

        const result = await auth.login(email, password);

        expect(result.token).toBeDefined();
        expect(result.user.email).toBe(email);
    });

    it('doit rejeter une connexion pour un utilisateur inexistant', async () => {
        await expect(auth.login('non@existant.com', 'pass')).rejects.toThrow('Utilisateur non trouvé');
    });

    it('doit rejeter une connexion avec un mauvais mot de passe', async () => {
        const email = `wrong.${Date.now()}@example.com`;
        await auth.signup({
            email,
            password: 'correct',
            nom: 'Wrong',
            prenom: 'Pass'
        });

        await expect(auth.login(email, 'incorrect')).rejects.toThrow('Mot de passe incorrect');
    });

    it('doit créer un administrateur via createAdmin', async () => {
        const adminData = {
            email: `admin.${Date.now()}@akel.com`,
            password: 'adminpass',
            nom: 'Super',
            prenom: 'Admin'
        };

        const admin = await auth.createAdmin(adminData);

        expect(admin.role).toBe('ADMIN');
        expect(admin.account.typeCompte).toBe('service');
    });

    it('doit échouer si createAdmin manque d\'infos', async () => {
        await expect(auth.createAdmin({ email: 'admin@test.com' })).rejects.toThrow('email et password sont requis');
    });

    it('doit échouer si l\'admin existe déjà', async () => {
        const email = 'unique.admin@test.com';
        await auth.createAdmin({ email, password: 'p' });
        await expect(auth.createAdmin({ email, password: 'p' })).rejects.toThrow('Cet email est déjà utilisé');
    });
});
