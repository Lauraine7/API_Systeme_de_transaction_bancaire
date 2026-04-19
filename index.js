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
            version:'1.0.0',
            description:'Documentation de l\'API de transaction bancaire',
        },
        servers: [
            {
                url: '/',
                description: 'Serveur de production',
            },
        ],
            
    },
    apis: ['./index.js'],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs',swaggerUi.serve,swaggerUi.setup(swaggerDocs));

app.use(express.json());
// ── Route de test ──────────────────────
app.get('/', (req, res) => {
    res.json({ message: ' Bienvenue sur l\'API Bancaire Mobile !' });
});

/**
 * @swagger
 * /api/comptes:
 *   post:
 *     summary: Créer un nouveau compte
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom: { type: string }
 *               prenom: { type: string }
 *               email: { type: string }
 *               typeCompte: { type: string }
 *     responses:
 *       201:
 *         description: Compte créé avec succès
 */
app.post('/api/comptes', (req, res) => {
    const { nom, prenom, email, typeCompte } = req.body;
    try {
        if (!nom || !prenom || !email) {
            return res.status(400).json({ erreur: 'nom, prenom et email sont obligatoires' });
        }
        const nouveauCompte = logic.creerCompte(nom, prenom, email, typeCompte);
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
 * /api/comptes:
 *   get:
 *     summary: Obtenir la liste de tous les comptes
 *     responses:
 *       200:
 *         description: Liste des comptes récupérée avec succès
 */
app.get('/api/comptes', (req, res) => {
    const comptes = logic.getComptes();
    res.json({
        total: comptes.length,
        comptes: comptes
    });
});

/**
 * @swagger
 * /api/comptes/{id}:
 *   get:
 *     summary: Obtenir les détails d'un compte spécifique
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
app.get('/api/comptes/:id', (req, res) => {
    const compte = logic.getCompte(req.params.id);
    if (!compte) {
        return res.status(404).json({ erreur: 'Compte introuvable' });
    }
    res.json({ compte });
});

/**
 * @swagger
 * /api/comptes/{id}/depot:
 *   post:
 *     summary: Effectuer un dépôt sur un compte
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
app.post('/api/comptes/:id/depot', (req, res) => {
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
 * /api/comptes/{id}/retrait:
 *   post:
 *     summary: Effectuer un retrait sur un compte
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
 *       422:
 *         description: Solde insuffisant
 */
app.post('/api/comptes/:id/retrait', (req, res) => {
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
 * /api/transfert:
 *   post:
 *     summary: Transférer de l'argent entre deux comptes
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
app.post('/api/transfert', (req, res) => {
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
 * /api/comptes/{id}/transactions:
 *   get:
 *     summary: Voir l'historique des transactions d'un compte
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
app.get('/api/comptes/:id/transactions', (req, res) => {
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
 * /api/comptes/{id}:
 *   delete:
 *     summary: Supprimer un compte
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
app.delete('/api/comptes/:id', (req, res) => {
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
 * /api/comptes/{id}/statut:
 *   patch:
 *     summary: Changer le statut d'un compte (actif, suspendu, fermé)
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
 *       400:
 *         description: Statut invalide
 *       404:
 *         description: Compte introuvable
 */
app.patch('/api/comptes/:id/statut', (req, res) => {
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
