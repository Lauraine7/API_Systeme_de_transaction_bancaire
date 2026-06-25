import { expect, it, describe, beforeAll } from 'vitest';
const logic = require('../../logic');
const prisma = require('../../prismaClient');

describe('Tests du Système de Gestion de Transactions Bancaires (Intégration)', () => {
    
    let compteId1;
    let compteId2;

    beforeAll(async () => {
        await prisma.transaction.deleteMany({});
        await prisma.account.deleteMany({});
        await prisma.user.deleteMany({});
        // Suppression de la création manuelle pour tester l'initialisation automatique (logic.assurerBanqueCentrale)
    });

    // ── 1. TEST DE CRÉATION DE COMPTE ────────────────────────────────────────
    it('1. Fonctionnalité : Création de compte', async () => {
        let uniqueEmail1 = `user.${Date.now()}@uba.com`;
        const compte = await logic.creerCompte('Koffi', 'Jean', uniqueEmail1, 'courant', 'UBA');

        expect(compte.nom).toBe('Koffi');
        expect(compte.userId).toBeNull();
        compteId1 = compte.id;

        // Default type
        const c2 = await logic.creerCompte('Def', 'Type', `def.${Date.now()}@test.com`, null, 'UBA');
        expect(c2.typeCompte).toBe('courant');

        // Existing email
        await expect(logic.creerCompte('A', 'B', uniqueEmail1, 'courant', 'UBA')).rejects.toThrow('existe déjà');
    });

    it('1b. Création de compte - Erreurs de validation', async () => {
        await expect(logic.creerCompte('Nom', 'Prenom', 'email@test.com', 'invalid_type')).rejects.toThrow('Type de compte invalide');
        await expect(logic.creerCompte('Nom', 'Prenom', 'email@test.com', 'courant', 'INVALID_BANK')).rejects.toThrow('Banque non supportée');
    });

    // ── 2. TEST DE DÉPÔT ─────────────────────────────────────────────────────
    it('2. Fonctionnalité : Opérations de dépôt', async () => {
        const result = await logic.deposer(compteId1, 5000);
        expect(result.compte.solde).toBe(5000);
        await expect(logic.deposer(compteId1, -100)).rejects.toThrow('Le montant doit être supérieur à 0');
    });

    // ── 3. TEST DE RETRAIT ───────────────────────────────────────────────────
    it('3. Fonctionnalité : Opérations de retrait (avec frais)', async () => {
        const result = await logic.retirer(compteId1, 2000);
        // 2000 + 1% (20) = 2020 débités. 5000 - 2020 = 2980
        expect(result.compte.solde).toBe(2980);
        expect(result.frais).toBe(20);

        // Test non-actif withdrawal
        await logic.changerStatut(compteId1, 'fermé');
        await expect(logic.retirer(compteId1, 100)).rejects.toThrow('le compte est fermé');
        await logic.changerStatut(compteId1, 'actif');

        await expect(logic.retirer(compteId1, -50)).rejects.toThrow('Le montant doit être supérieur à 0');
        await expect(logic.retirer(compteId1, 10000)).rejects.toThrow('Solde insuffisant');
    });

    // ── 4. TEST DE TRANSFERT DE FONDS ────────────────────────────────────────
    it('4. Fonctionnalité : Transferts de fonds entre comptes', async () => {
        let uniqueEmail2 = `dest.${Date.now()}@eco.com`;
        const compteDest = await logic.creerCompte('Amadou', 'Ali', uniqueEmail2, 'epargne', 'ECO');
        compteId2 = compteDest.id;

        const result = await logic.transferer(compteId1, compteId2, 1000);
        expect(result.frais).toBeGreaterThan(0); // Inter-bank

        // Erreurs transfert
        await expect(logic.transferer(compteId1, compteId1, 100)).rejects.toThrow('Expéditeur et destinataire doivent être différents');
        await expect(logic.transferer(compteId1, compteId2, 9999999)).rejects.toThrow('Solde insuffisant');
        await expect(logic.transferer(null, compteId2, 100)).rejects.toThrow('obligatoires');
        await expect(logic.transferer(999999, compteId2, 100)).rejects.toThrow('expéditeur introuvable');
        await expect(logic.transferer(compteId1, 999999, 100)).rejects.toThrow('destinataire introuvable');

        // Test transfert intra-banque
        let uniqueEmail3 = `intra.${Date.now()}@uba.com`;
        const compteIntra = await logic.creerCompte('Intra', 'User', uniqueEmail3, 'courant', 'UBA');
        await logic.deposer(compteIntra.id, 5000);
        const resultIntra = await logic.transferer(compteIntra.id, compteId1, 500);
        expect(resultIntra.frais).toBe(0);

        // Erreurs transfert
        await expect(logic.transferer(compteId1, compteId1, 100)).rejects.toThrow('Expéditeur et destinataire doivent être différents');
        await expect(logic.transferer(compteId1, compteId2, 9999999)).rejects.toThrow('Solde insuffisant');
    });

    // ── 5. TEST DE L'HISTORIQUE DES TRANSACTIONS ────────────────────────────
    it('5. Fonctionnalité : Historique complet des transactions', async () => {
        const transactions = await logic.getTransactions(compteId1);
        expect(Array.isArray(transactions)).toBe(true);
        expect(transactions.length).toBeGreaterThan(0);
    });

    // ── 6. AUTRES SERVICES ──────────────────────────────────────────────────
    it('6. Fonctionnalité : Gestion des statuts et suppression', async () => {
        await logic.changerStatut(compteId1, 'suspendu');
        const compte = await logic.getCompte(compteId1);
        expect(compte.statut).toBe('suspendu');

        await expect(logic.deposer(compteId1, 100)).rejects.toThrow('Opération impossible : le compte est suspendu');
        await expect(logic.changerStatut(compteId1, 'invalid')).rejects.toThrow('Statut invalide');

        await expect(logic.supprimerCompte(0)).rejects.toThrow('Impossible de supprimer le compte BANQUE CENTRALE');
        
        await logic.supprimerCompte(compteId2);
        const deleted = await logic.getCompte(compteId2);
        expect(deleted).toBeNull();
    });

    it('7. Fonctionnalité : Statistiques et Modification', async () => {
        const stats = await logic.getStatistiques();
        expect(stats.totalComptes).toBeGreaterThan(0);
        
        // Mock case for soldeTotal: totalSolde._sum.solde || 0
        // We can't easily make it null without deleting everything, but we can verify it works.
        
        await logic.modifierCompte(compteId1, { nom: 'Updated' });
        const updated = await logic.getCompte(compteId1);
        expect(updated.nom).toBe('Updated');
    });

    it('8. Statistiques avec base vide', async () => {
        await prisma.transaction.deleteMany({});
        await prisma.account.deleteMany({});
        // Ne pas appeler assurerBanqueCentrale ici
        const stats = await logic.getStatistiques();
        expect(stats.soldeTotal).toBe(0);
    });

});