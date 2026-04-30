const express = require('express');
const logic = require('./logic');
const app = express();


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
app.post('/comptes', (req, res) => {
    const { nom, prenom, email, typeCompte, codeBanque } = req.body;
    try {
        if (!nom || !prenom || !email) {
            return res.status(400).json({ erreur: 'nom, prenom et email sont obligatoires' });
        }
        const nouveauCompte = logic.creerCompte(nom, prenom, email, typeCompte, codeBanque);
        res.status(201).json({
            message: 'Compte créé avec succès !',
            compte: nouveauCompte
        });
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
app.get('/comptes', (req, res) => {
    const comptes = logic.getComptes();
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
app.get('/comptes/:id', (req, res) => {
    const compte = logic.getCompte(req.params.id);
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
app.get('/comptes/:id/solde', (req, res) => {
    const compte = logic.getCompte(req.params.id);
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
app.delete('/comptes/:id', (req, res) => {
    try {
        const compte = logic.supprimerCompte(req.params.id);
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
app.post('/comptes/:id/depot', (req, res) => {
    const { montant } = req.body;
    try {
        const { compte, transaction } = logic.deposer(req.params.id, montant);
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
app.post('/comptes/:id/retrait', (req, res) => {
    const { montant } = req.body;
    try {
        const { compte, transaction } = logic.retirer(req.params.id, montant);
        res.json({
            message: `Retrait de ${montant} FCFA effectué avec succès !`,
            nouveauSolde: `${compte.solde} FCFA`,
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
app.post('/transfert', (req, res) => {
    const { expediteurId, destinataireId, montant } = req.body;
    try {
        const { freshExpediteur, frais } = logic.transferer(expediteurId, destinataireId, montant);
        res.json({
            message: `Transfert de ${montant} FCFA réussi (Frais: ${frais} FCFA)`,
            nouveauSoldeExpediteur: `${freshExpediteur.solde} FCFA`
        });
    } catch (error) {
        let status = 400;
        if (error.message.includes('introuvable')) status = 404;
        else if (error.message.includes('insuffisant')) status = 422;
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
app.get('/comptes/:id/transactions', (req, res) => {
    try {
        const transactions = logic.getTransactions(req.params.id);
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
 * /comptes/{id}/statut:
 *   patch:
 *     summary: Changer le statut d'un compte
 *     tags: [Accounts]
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
 *               statut: { type: string, enum: [actif, suspendu, fermé] }
 *     responses:
 *       200:
 *         description: Statut mis à jour avec succès
 */
app.patch('/comptes/:id/statut', (req, res) => {
    const { statut } = req.body;
    try {
        const compte = logic.changerStatut(req.params.id, statut);
        res.json({
            message: `Statut du compte ID ${compte.id} mis à jour : ${statut}`,
            compte
        });
    } catch (error) {
        res.status(error.message.includes('introuvable') ? 404 : 400).json({ erreur: error.message });
    }
});

// ── Démarrage du serveur ───────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});

// Garde la boucle d'événements active si elle se vide anormalement
setInterval(() => {}, 10000);
