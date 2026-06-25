const express = require('express');
const cors = require('cors');
const logic = require('./logic');
const auth = require('./auth');
const { authenticateToken, authorizeRole, isOwnerOrAdmin } = require('./middleware/authMiddleware');
const app = express();

app.use(cors());
app.use(express.json());


// ajout de swagger
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Bancaire Mobile',
            version: '1.0.0',
            description: 'Documentation de l\'API de transaction bancaire',
        },
        servers: [
            {
                url: 'https://api-systeme-de-transaction-bancaire.onrender.com',
                description: 'Serveur de production (Render)',
            },
            {
                url: 'http://localhost:4000',
                description: 'Serveur local (développement)',
            },
        ],
        tags: [
            { name: 'Accounts', description: 'Gestion des comptes bancaires' },
            { name: 'Transactions', description: 'Opérations financières' }
        ],
        components: {
            schemas: {
                Account: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        nom: { type: 'string' },
                        prenom: { type: 'string' },
                        email: { type: 'string' },
                        typeCompte: { type: 'string', enum: ['courant', 'epargne'] },
                        codeBanque: { type: 'string', enum: ['UBA', 'ECO', 'AFB', 'BIC'], description: 'Code de la banque (UBA par défaut)' },
                        solde: { type: 'number' },
                        statut: { type: 'string', enum: ['actif', 'suspendu', 'fermé'] }
                    }
                },
                Transaction: {
                    type: 'object',
                    properties: {
                        type: { type: 'string' },
                        montant: { type: 'number' },
                        date: { type: 'string', format: 'date-time' },
                        soldeApres: { type: 'number' }
                    }
                }
            }
        }
    },
    apis: ['./index.js'],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
// Dark mode CSS for Swagger UI
const darkThemeOptions = {
    customCss: `
        .swagger-ui { background-color: #1b1b1b; color: #eee; }
        .swagger-ui .info .title, .swagger-ui .info li, .swagger-ui .info p, .swagger-ui .info table, .swagger-ui .model-title, .swagger-ui .tab li { color: #eee; }
        .swagger-ui .opblock.opblock-get { background: rgba(33, 150, 243, 0.1); border-color: #2196f3; }
        .swagger-ui .opblock.opblock-post { background: rgba(76, 175, 80, 0.1); border-color: #4caf50; }
        .swagger-ui .opblock.opblock-delete { background: rgba(244, 67, 54, 0.1); border-color: #f44336; }
        .swagger-ui .opblock.opblock-patch { background: rgba(255, 152, 0, 0.1); border-color: #ff9800; }
        .swagger-ui .opblock .opblock-summary-path { color: #eee; }
        .swagger-ui .opblock .opblock-summary-description { color: #bbb; }
        .swagger-ui .scheme-container { background: #1b1b1b; box-shadow: none; border-bottom: 1px solid #333; }
        .swagger-ui select { background: #333; color: #eee; }
        .swagger-ui .response-col_status, .swagger-ui .response-col_links { color: #eee; }
    `
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, darkThemeOptions));

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: Utilisateur créé
 */
app.post('/signup', async (req, res) => {
    // Attendre: email, password, nom, prenom, et options de compte
    try {
        const user = await auth.signup(req.body);
        res.status(201).json({ message: 'Compte utilisateur créé avec succès', user: { id: user.id, email: user.email, accountId: user.account?.id } });
    } catch (error) {
        res.status(400).json({ erreur: error.message });
    }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Connexion réussie, retourne un token
 */
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { user, token } = await auth.login(email, password);
        res.json({ 
            message: 'Connexion réussie', 
            token, 
            user: { id: user.id, email: user.email, role: user.role, accountId: user.account?.id } 
        });
    } catch (error) {
        res.status(401).json({ erreur: error.message });
    }
});

/**
 * @swagger
 * /admin/signup:
 *   post:
 *     summary: Création d'un administrateur (Superadmin seulement)
 *     tags: [Admin]
 */
app.post('/admin/signup', authenticateToken, authorizeRole(['SUPERADMIN']), async (req, res) => {
    // Route pour que le SUPERADMIN crée d'autres administrateurs
    const { email, password, nom, prenom } = req.body;
    try {
        const user = await auth.createAdmin({ email, password, nom, prenom });
        res.status(201).json({ message: 'Administrateur créé avec succès', user: { id: user.id, email: user.email } });
    } catch (error) {
        res.status(400).json({ erreur: error.message });
    }
});

app.use(express.json());
// ── Route de test ──────────────────────
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #eee;">
            <h1 style="color: #2c3e50;"> API </h1>
            <p>Bienvenue sur votre système de gestion de transactions bancaires.</p>
            <h2 style="color: #34495e;">Fonctionnalités :</h2>
            <ul>
                <li>Gestion des comptes bancaires (Création, Détails, Suppression)</li>
                <li>Opérations de dépôt et de retrait</li>
                <li>Transferts de fonds entre comptes</li>
                <li>Historique complet des transactions</li>
                <li>Gestion des statuts de compte</li>
            </ul>
            <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
                <strong> Documentation :</strong> 
                <a href="/api-docs" style="color: #3498db; text-decoration: none; font-weight: bold;">Accéder au Swagger UI</a>
            </div>
        </div>
    `);
});


/**
 * @swagger
 * /comptes:
 *   post:
 *     summary: Créer un nouveau compte
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Account'
 *     responses:
 *       201:
 *         description: Compte créé avec succès
 */
// Création de compte réservée aux administrateurs
app.post('/admin/comptes', authenticateToken, authorizeRole(['ADMIN', 'SUPERADMIN']), async (req, res) => {
    const { nom, prenom, email, typeCompte, codeBanque, userId } = req.body;
    try {
        if (!nom || !prenom || !email) {
            return res.status(400).json({ erreur: 'nom, prenom et email sont obligatoires' });
        }
        const nouveauCompte = await logic.creerCompte(nom, prenom, email, typeCompte, codeBanque, userId);
        res.status(201).json({ message: 'Compte créé avec succès !', compte: nouveauCompte });
    } catch (error) {
        res.status(error.message.includes('existe déjà') ? 409 : 400).json({ erreur: error.message });
    }
});

/**
 * @swagger
 * /comptes:
 *   get:
 *     summary: Lister tous les comptes
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: Liste des comptes récupérée avec succès
 */
// Lister tous les comptes : Admin seulement
app.get('/comptes', authenticateToken, authorizeRole(['ADMIN', 'SUPERADMIN']), async (req, res) => {
    const comptes = await logic.getComptes();
    res.json({
        total: comptes.length,
        comptes: comptes
    });
});

/**
 * @swagger
 * /comptes/{id}:
 *   get:
 *     summary: Détails d'un compte
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du compte
 *     responses:
 *       200:
 *         description: Détails du compte
 *       404:
 *         description: Compte introuvable
 */
// Détails d'un compte : Propriétaire ou Admin
app.get('/comptes/:id', authenticateToken, isOwnerOrAdmin, async (req, res) => {
    const compte = await logic.getCompte(req.params.id);
    if (!compte) {
        return res.status(404).json({ erreur: 'Compte introuvable' });
    }
    res.json({ compte });
});

/**
 * @swagger
 * /comptes/{id}/solde:
 *   get:
 *     summary: Consulter le solde d'un compte
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Solde du compte
 */
// Consulter le solde : Propriétaire ou Admin
app.get('/comptes/:id/solde', authenticateToken, isOwnerOrAdmin, async (req, res) => {
    const compte = await logic.getCompte(req.params.id);
    if (!compte) {
        return res.status(404).json({ erreur: 'Compte introuvable' });
    }
    res.json({
        compte: `${compte.nom} ${compte.prenom}`,
        solde: `${compte.solde} FCFA`
    });
});

/**
 * @swagger
 * /comptes/{id}:
 *   delete:
 *     summary: Supprimer un compte
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Compte supprimé
 */
// Suppression de compte : Admin seulement
app.delete('/comptes/:id', authenticateToken, authorizeRole(['ADMIN', 'SUPERADMIN']), async (req, res) => {
    try {
        const compte = await logic.supprimerCompte(req.params.id);
        res.json({
            message: `Compte ID ${compte.id} supprimé avec succès !`,
            compte
        });
    } catch (error) {
        res.status(error.message.includes('introuvable') ? 404 : 400).json({ erreur: error.message });
    }
});

/**
 * @swagger
 * /comptes/{id}/depot:
 *   post:
 *     summary: Effectuer un dépôt
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               montant: { type: number }
 *     responses:
 *       200:
 *         description: Dépôt réussi
 */
// Effectuer un dépôt : Propriétaire ou Admin
app.post('/comptes/:id/depot', authenticateToken, isOwnerOrAdmin, async (req, res) => {
    const { montant } = req.body;
    try {
        const { compte, transaction } = await logic.deposer(req.params.id, montant);
        res.json({
            message: `Dépôt de ${montant} FCFA effectué avec succès !`,
            nouveauSolde: `${compte.solde} FCFA`,
            transaction
        });
    } catch (error) {
        res.status(error.message === 'Compte introuvable' ? 404 : 400).json({ erreur: error.message });
    }
});

/**
 * @swagger
 * /comptes/{id}/retrait:
 *   post:
 *     summary: Effectuer un retrait
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               montant: { type: number }
 *     responses:
 *       200:
 *         description: Retrait réussi
 */
// Effectuer un retrait : Propriétaire ou Admin
app.post('/comptes/:id/retrait', authenticateToken, isOwnerOrAdmin, async (req, res) => {
    const { montant } = req.body;
    try {
        const { compte, transaction, frais } = await logic.retirer(req.params.id, montant);
        res.json({
            message: `Retrait de ${montant} FCFA effectué avec succès ! (Frais : ${frais} FCFA)`,
            nouveauSolde: `${compte.solde} FCFA`,
            frais: `${frais} FCFA`,
            transaction
        });
    } catch (error) {
        const status = error.message === 'Compte introuvable' ? 404 : (error.message.includes('insuffisant') ? 422 : 400);
        res.status(status).json({ erreur: error.message });
    }
});

/**
 * @swagger
 * /transfert:
 *   post:
 *     summary: Transférer de l'argent
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expediteurId: { type: integer }
 *               destinataireId: { type: integer }
 *               montant: { type: number }
 *     responses:
 *       200:
 *         description: Transfert réussi
 */
// Transférer de l'argent : Propriétaire ou Admin (débit de son propre compte)
app.post('/transfert', authenticateToken, async (req, res) => {
    const { expediteurId, destinataireId, montant } = req.body;
    try {
        const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(req.user.role?.toUpperCase());
        
        // Un utilisateur lambda ne peut envoyer de l'argent que DEPUIS son propre compte
        if (!isAdmin && parseInt(expediteurId) !== req.user.accountId) {
            return res.status(403).json({ erreur: 'Vous ne pouvez effectuer un transfert que depuis votre propre compte' });
        }

        const { freshExpediteur, frais } = await logic.transferer(expediteurId, destinataireId, montant);
        res.json({
            message: `Transfert de ${montant} FCFA réussi (Frais: ${frais} FCFA)`,
            nouveauSoldeExpediteur: `${freshExpediteur.solde} FCFA`
        });
    } catch (error) {
        console.log("DEBUG TRANSFER ERROR:", error.message);
        const msg = (error.message || '').toLowerCase();
        let status = 400;
        if (msg.includes('introuvable') || msg.includes('not found')) status = 404;
        else if (msg.includes('insuffisant') || msg.includes('insufficient')) status = 422;
        res.status(status).json({ erreur: error.message });
    }
});

/**
 * @swagger
 * /comptes/{id}/transactions:
 *   get:
 *     summary: Historique des transactions
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des transactions
 */
// Historique des transactions : Propriétaire ou Admin
app.get('/comptes/:id/transactions', authenticateToken, isOwnerOrAdmin, async (req, res) => {
    try {
        const transactions = await logic.getTransactions(req.params.id);
        res.json({
            total: transactions.length,
            transactions
        });
    } catch (error) {
        res.status(404).json({ erreur: error.message });
    }
});

/**
 * @swagger
 * /admin/statistiques:
 *   get:
 *     summary: Obtenir les statistiques globales (Admin seulement)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
app.get('/admin/statistiques', authenticateToken, authorizeRole(['ADMIN','SUPERADMIN']), async (req, res) => {
    const stats = await logic.getStatistiques();
    res.json(stats);
});

/**
 * @swagger
 * /admin/comptes:
 *   get:
 *     summary: Lister tous les comptes avec détails (Admin seulement)
 *     tags: [Admin]
 */
app.get('/admin/comptes', authenticateToken, authorizeRole(['ADMIN', 'SUPERADMIN']), async (req, res) => {
    const counts = await logic.getComptes();
    const type = req.query.type; // 'USER' or 'ADMIN'
    
    if (type === 'USER') {
        const users = await prisma.user.findMany({ where: { role: 'USER' }, include: { account: true } });
        return res.json(users.map(u => ({ ...u.account, userRole: u.role })).filter(a => a.id !== undefined));
    } else if (type === 'ADMIN') {
        const admins = await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'SUPERADMIN'] } }, include: { account: true } });
        return res.json(admins.map(u => ({ ...u.account, userRole: u.role })).filter(a => a.id !== undefined));
    }
    
    res.json(counts);
});

/**
 * @swagger
 * /admin/comptes/{id}:
 *   patch:
 *     summary: Modifier n'importe quel compte (Restrictions sur les admins)
 *     tags: [Admin]
 */
app.patch('/admin/comptes/:id', authenticateToken, authorizeRole(['ADMIN','SUPERADMIN']), async (req, res) => {
    try {
        const targetAccount = await logic.getCompte(req.params.id);
        if (!targetAccount) return res.status(404).json({ erreur: 'Compte introuvable' });

        // Un ADMIN ne peut pas modifier un autre ADMIN ou un SUPERADMIN
        if (req.user.role === 'ADMIN') {
            const targetUser = await prisma.user.findUnique({ where: { id: targetAccount.userId } });
            if (targetUser && (targetUser.role === 'ADMIN' || targetUser.role === 'SUPERADMIN')) {
                return res.status(403).json({ erreur: 'Un administrateur ne peut pas modifier un autre compte administratif' });
            }
        }

        const compte = await logic.modifierCompte(req.params.id, req.body);
        res.json({ message: 'Compte mis à jour par l\'administrateur', compte });
    } catch (error) {
        res.status(400).json({ erreur: error.message });
    }
});

/**
 * @swagger
 * /admin/comptes/{id}:
 *   delete:
 *     summary: Supprimer n'importe quel compte (Restrictions sur les admins)
 *     tags: [Admin]
 */
app.delete('/admin/comptes/:id', authenticateToken, authorizeRole(['ADMIN','SUPERADMIN']), async (req, res) => {
    try {
        const targetAccount = await logic.getCompte(req.params.id);
        if (!targetAccount) return res.status(404).json({ erreur: 'Compte introuvable' });

        // Un ADMIN ne peut pas supprimer un autre ADMIN ou un SUPERADMIN
        if (req.user.role === 'ADMIN') {
            const targetUser = await prisma.user.findUnique({ where: { id: targetAccount.userId } });
            if (targetUser && (targetUser.role === 'ADMIN' || targetUser.role === 'SUPERADMIN')) {
                return res.status(403).json({ erreur: 'Un administrateur ne peut pas supprimer un autre compte administratif' });
            }
        }

        const compte = await logic.supprimerCompte(req.params.id);
        res.json({ message: 'Compte supprimé par l\'administrateur', compte });
    } catch (error) {
        res.status(400).json({ erreur: error.message });
    }
});

// ── Démarrage du serveur ───────────────
/* v8 ignore next 8 */
if (require.main === module) {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, async () => {
        console.log(`Serveur démarré sur http://localhost:${PORT}`);
        console.log(`Documentation disponible sur http://localhost:${PORT}/api-docs`);
        try {
            await auth.bootstrapSuperadmin();
        } catch (e) {
            console.error('Erreur lors du bootstrap:', e);
        }
    });
}

module.exports = app;
setInterval(() => {}, 10000);
