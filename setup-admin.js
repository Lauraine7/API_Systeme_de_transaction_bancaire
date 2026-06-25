const { signup } = require('./auth');
const prisma = require('./prismaClient');

async function setup() {
    const email = 'admin@akel.com';
    const password = 'adminpassword123';
    
    try {
        console.log(`🚀 Création de l'administrateur par défaut : ${email}...`);
        const user = await signup(email, password, 'ADMIN');
        console.log('✅ Administrateur créé avec succès !');
        console.log(`📧 Email : ${email}`);
        console.log(`🔑 Mot de passe : ${password}`);
    } catch (error) {
        if (error.message.includes('déjà utilisé')) {
            console.log('ℹ️ L\'administrateur existe déjà.');
        } else {
            console.error('❌ Erreur lors du setup :', error.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

setup();
