const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('./prismaClient');
const logic = require('./logic');
const { JWT_SECRET } = require('./middleware/authMiddleware');

const signup = async (data) => {
    // data should contain: email, password, nom, prenom, typeCompte, codeBanque, role(optional)
    const { email, password, role = 'USER', nom, prenom, typeCompte, codeBanque } = data;

    if (!email || !password || !nom || !prenom) {
        throw new Error('email, password, nom et prenom sont obligatoires pour l\'inscription');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('Cet email est déjà utilisé');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            role: role.toUpperCase()
        }
    });

    // Utiliser logic.creerCompte pour bénéficier de ses validations et initialisations
    try {
        const account = await logic.creerCompte(nom, prenom, email, typeCompte, codeBanque, user.id);
        user.account = account;
        return user;
    } catch (error) {
        // En cas d'échec de la création du compte, on supprime l'utilisateur créé pour rester cohérent
        await prisma.user.delete({ where: { id: user.id } });
        throw error;
    }
};

const login = async (email, password) => {
    const user = await prisma.user.findUnique({ 
        where: { email },
        include: { account: true }
    });
    
    if (!user) throw new Error('Utilisateur non trouvé');

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new Error('Mot de passe incorrect');

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, accountId: user.account?.id },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    return { user, token };
};

const createAdmin = async ({ email, password, nom = 'Admin', prenom = 'Admin' } = {}) => {
    if (!email || !password) throw new Error('email et password sont requis pour créer un admin');
    // Crée un user de rôle ADMIN sans forcément créer de compte détaillé
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('Cet email est déjà utilisé');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            role: 'ADMIN'
        }
    });

    // Optionnellement créer un compte minimal pour l'admin
    const account = await prisma.account.create({
        data: {
            nom,
            prenom,
            email,
            typeCompte: 'service',
            codeBanque: 'CENTRAL',
            solde: 0,
            statut: 'actif',
            userId: user.id
        }
    });

    user.account = account;
    return user;
};

const bootstrapSuperadmin = async () => {
    const email = 'super@gmail.com';
    const password = 'super123';
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
        console.log('--- Bootstrapping SUPERADMIN ---');
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'SUPERADMIN'
            }
        });
        
        await prisma.account.create({
            data: {
                id: 999, // Specific ID for superadmin account to avoid conflict
                nom: 'SUPER',
                prenom: 'ADMIN',
                email,
                typeCompte: 'service',
                codeBanque: 'CENTRAL',
                solde: 0,
                statut: 'actif',
                userId: user.id
            }
        });
        console.log('--- SUPERADMIN created successfully ---');
    }
};

module.exports = { signup, login, createAdmin, bootstrapSuperadmin };
