const readline = require('readline');
const logic = require('./logic');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const afficherMenu = () => {
    console.log('\n--- MENU BANQUE-API ---');
    console.log('1. Créer un nouveau compte');
    console.log('2. Lister tous les comptes');
    console.log('3. Effectuer un dépôt');
    console.log('4. Effectuer un retrait');
    console.log('5. Faire un transfert');
    console.log('6. Voir l\'historique des transactions');
    console.log('7. Supprimer un compte');
    console.log('8. Changer le statut d\'un compte');
    console.log('9. Quitter');
    console.log('--------------------------');
};

const menuAction = async () => {
    afficherMenu();
    const choix = await question('Choisissez une option (1-9) : ');

    switch (choix) {
        case '1':
            const nom = await question('Nom : ');
            const prenom = await question('Prénom : ');
            const email = await question('Email : ');
            const typeCompte = await question('Type (courant/epargne, défaut: courant) : ') || 'courant';
            console.log('Banques disponibles : UBA, ECO, AFB, BIC');
            const codeBanque = (await question('Code Banque (défaut: UBA) : ')).toUpperCase() || 'UBA';
            try {
                const compte = logic.creerCompte(nom, prenom, email, typeCompte, codeBanque);
                console.log(`Compte créé avec succès ! ID: ${compte.id} [${compte.codeBanque}]`);
            } catch (error) {
                console.log(` Erreur : ${error.message}`);
            }
            break;

        case '2':
            const comptes = logic.getComptes();
            console.log('\n--- LISTE DES COMPTES ---');
            comptes.forEach(c => {
                const labelStatut = c.statut === 'actif' ? 'ACTIF' : (c.statut === 'suspendu' ? 'SUSPENDU' : 'FERME');
                const banque = c.codeBanque || 'UBA';
                console.log(`ID: ${c.id} | [${banque}] | ${c.nom} ${c.prenom} | Solde: ${c.solde} FCFA | Statut: ${labelStatut}`);
            });
            break;

        case '3':
            const idDepot = await question('ID du compte : ');
            const montantDepot = parseFloat(await question('Montant du dépôt : '));
            try {
                const { compte } = logic.deposer(idDepot, montantDepot);
                console.log(` Dépôt réussi ! Nouveau solde : ${compte.solde} FCFA`);
            } catch (error) {
                console.log(`Erreur : ${error.message}`);
            }
            break;

        case '4':
            const idRetrait = await question('ID du compte : ');
            const montantRetrait = parseFloat(await question('Montant du retrait : '));
            try {
                const { compte } = logic.retirer(idRetrait, montantRetrait);
                console.log(` Retrait réussi ! Nouveau solde : ${compte.solde} FCFA`);
            } catch (error) {
                console.log(` Erreur : ${error.message}`);
            }
            break;

        case '5':
            const expId = await question('ID expéditeur : ');
            const destId = await question('ID destinataire : ');
            const montantTrans = parseFloat(await question('Montant à transférer : '));
            try {
                const { freshExpediteur, frais } = logic.transferer(expId, destId, montantTrans);
                console.log(` Transfert réussi ! Frais: ${frais} FCFA. Votre nouveau solde: ${freshExpediteur.solde} FCFA`);
            } catch (error) {
                console.log(` Erreur : ${error.message}`);
            }
            break;

        case '6':
            const idTrans = await question('ID du compte : ');
            try {
                const transactions = logic.getTransactions(idTrans);
                console.log(`\n--- HISTORIQUE (Total: ${transactions.length}) ---`);
                transactions.reverse().slice(0, 10).forEach(t => {
                    const date = new Date(t.date).toLocaleString('fr-FR');
                    let detail = '';
                    if (t.type === 'depot') detail = `+${t.montant}`;
                    else if (t.type === 'retrait') detail = `-${t.montant}`;
                    else if (t.type.includes('transfert_inter_envoye')) detail = `→ Vers ID ${t.vers} [${t.banqueDest}] : -${t.montant} (+${t.frais} frais)`;
                    else if (t.type.includes('transfert_intra_envoye')) detail = `→ Vers ID ${t.vers} [${t.banqueDest}] : -${t.montant} (Gratos)`;
                    else if (t.type.includes('transfert_inter_recu')) detail = `← De ID ${t.de} [${t.banqueExp}] : +${t.montant}`;
                    else if (t.type.includes('transfert_intra_recu')) detail = `← De ID ${t.de} [${t.banqueExp}] : +${t.montant}`;
                    else if (t.type === 'commission_transfert') detail = `Commission (Inter-banque) : +${t.frais}`;

                    console.log(`[${date}] ${t.type.toUpperCase()}: ${detail} | Solde après: ${t.soldeApres}`);
                });
            } catch (error) {
                console.log(`Erreur : ${error.message}`);
            }
            break;

        case '7':
            const idASupprimer = await question('ID du compte à supprimer : ');
            const confirmation = await question(`Êtes-vous sûr de vouloir supprimer le compte ID ${idASupprimer} ? (y/N) : `);
            if (confirmation.toLowerCase() === 'y') {
                try {
                    const compte = logic.supprimerCompte(idASupprimer);
                    console.log(`Compte ID ${compte.id} (${compte.nom} ${compte.prenom}) supprimé avec succès !`);
                } catch (error) {
                    console.log(`Erreur : ${error.message}`);
                }
            } else {
                console.log('Suppression annulée.');
            }
            break;

        case '8':
            const idStatut = await question('ID du compte à modifier : ');
            console.log('Nouveau statut possible : actif, suspendu, fermé');
            const nouveauStatut = await question('Entrez le nouveau statut : ');
            try {
                const compte = logic.changerStatut(idStatut, nouveauStatut);
                console.log(`Statut du compte ID ${compte.id} mis à jour : ${compte.statut}`);
            } catch (error) {
                console.log(` Erreur : ${error.message}`);
            }
            break;

        case '9':
            console.log('Au revoir ! ');
            rl.close();
            return;

        default:
            console.log(' Choix invalide, réessayez.');
    }

    await menuAction();
};

console.log('Bienvenue dans l\'interface de gestion bancaire.');
menuAction();
