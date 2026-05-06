const logic = require('./logic');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'comptes.json');

async function verifyWithdrawalFee() {
    console.log("--- Début de la vérification des frais de retrait ---");

    // 1. Créer un nouveau compte pour le test
    const nom = "Test";
    const prenom = "Withdrawal";
    const email = `test_withdraw_${Date.now()}@example.com`;
    const compte = logic.creerCompte(nom, prenom, email);
    console.log(`Compte créé : ID ${compte.id}, Solde initial: ${compte.solde}`);

    // 2. Déposer de l'argent
    const montantDepot = 10000;
    logic.deposer(compte.id, montantDepot);
    let freshCompte = logic.getCompte(compte.id);
    console.log(`Dépôt de ${montantDepot} effectué. Nouveau solde: ${freshCompte.solde}`);

    // 3. Effectuer un retrait
    const montantRetrait = 1000;
    const fraisAttendus = Math.round(montantRetrait * 0.01);
    const totalAttenduADebiter = montantRetrait + fraisAttendus;
    const soldeAttenduApres = freshCompte.solde - totalAttenduADebiter;

    console.log(`Tentative de retrait de ${montantRetrait}. Frais attendus: ${fraisAttendus}. Total à débiiter: ${totalAttenduADebiter}`);

    // Obtenir le solde initial de la banque
    const banqueInitiale = logic.getCompte(0);
    const soldeBanqueInitial = banqueInitiale.solde;

    const result = logic.retirer(compte.id, montantRetrait);
    freshCompte = logic.getCompte(compte.id);
    const banqueFinale = logic.getCompte(0);

    console.log(`Résultat du retrait: Nouveau solde client: ${freshCompte.solde}`);
    console.log(`Nouveau solde Banque Centrale: ${banqueFinale.solde}`);

    // 4. Assertions
    let success = true;
    if (freshCompte.solde !== soldeAttenduApres) {
        console.error(`FAILURE: Le solde du compte client est incorrect. Attendu: ${soldeAttenduApres}, Obtenu: ${freshCompte.solde}`);
        success = false;
    } else {
        console.log("SUCCESS: Le solde du compte client est correct.");
    }

    if (banqueFinale.solde !== soldeBanqueInitial + fraisAttendus) {
        console.error(`FAILURE: Le solde de la Banque Centrale est incorrect. Attendu: ${soldeBanqueInitial + fraisAttendus}, Obtenu: ${banqueFinale.solde}`);
        success = false;
    } else {
        console.log("SUCCESS: Le solde de la Banque Centrale est correct.");
    }

    const lastTransactionClient = freshCompte.transactions[freshCompte.transactions.length - 1];
    if (lastTransactionClient.type === 'retrait' && lastTransactionClient.frais === fraisAttendus) {
        console.log("SUCCESS: La transaction client contient les détails des frais.");
    } else {
        console.error("FAILURE: La transaction client est incorrecte ou manque de détails sur les frais.", lastTransactionClient);
        success = false;
    }

    const lastTransactionBanque = banqueFinale.transactions[banqueFinale.transactions.length - 1];
    if (lastTransactionBanque.type === 'commission_retrait' && lastTransactionBanque.frais === fraisAttendus) {
        console.log("SUCCESS: La transaction banque contient les détails de la commission.");
    } else {
        console.error("FAILURE: La transaction banque est incorrecte.", lastTransactionBanque);
        success = false;
    }

    if (success) {
        console.log("--- VÉRIFICATION RÉUSSIE ---");
    } else {
        console.log("--- VÉRIFICATION ÉCHOUÉE ---");
        process.exit(1);
    }
}

verifyWithdrawalFee().catch(err => {
    console.error(err);
    process.exit(1);
});
