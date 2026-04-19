const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'comptes.json');

// Helper pour lire les comptes
const lireComptes = () => {
    try {
        if (!fs.existsSync(DB_FILE)) {
            fs.writeFileSync(DB_FILE, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(DB_FILE, 'utf8');
        let comptes = JSON.parse(data);

        // Assurer que le compte Banque ID 0 existe
        if (!comptes.find(c => c.id === 0)) {
            const compteBanque = {
                id: 0,
                nom: "BANQUE",
                prenom: "CENTRALE",
                email: "banque@system.com",
                typeCompte: "service",
                solde: 0,
                statut: "actif",
                dateCreation: new Date(),
                transactions: []
            };
            comptes.unshift(compteBanque);
            fs.writeFileSync(DB_FILE, JSON.stringify(comptes, null, 2));
        }
        return comptes;
    } catch (error) {
        console.error("Erreur lors de la lecture des comptes :", error);
        return [];
    }
};

// Helper pour sauvegarder les comptes
const sauvegarderComptes = (comptes) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(comptes, null, 2));
    } catch (error) {
        console.error("Erreur lors de la sauvegarde des comptes :", error);
    }
};

const creerCompte = (nom, prenom, email, typeCompte = 'courant') => {
    const comptes = lireComptes();
    const emailExiste = comptes.find(c => c.email === email);
    if (emailExiste) {
        throw new Error('Un compte avec cet email existe déjà');
    }

    const nouveauCompte = {
        id: comptes.length > 0 ? Math.max(...comptes.map(c => c.id)) + 1 : 1,
        nom,
        prenom,
        email,
        typeCompte,
        solde: 0,
        statut: 'actif',
        dateCreation: new Date(),
        transactions: []
    };

    comptes.push(nouveauCompte);
    sauvegarderComptes(comptes);
    return nouveauCompte;
};

const getComptes = () => {
    return lireComptes();
};

const getCompte = (id) => {
    const comptes = lireComptes();
    return comptes.find(c => c.id === parseInt(id));
};

const deposer = (id, montant) => {
    if (!montant || montant <= 0) {
        throw new Error('Le montant doit être supérieur à 0');
    }

    const comptes = lireComptes();
    const index = comptes.findIndex(c => c.id === parseInt(id));

    if (index === -1) {
        throw new Error('Compte introuvable');
    }

    if (comptes[index].statut !== 'actif') {
        throw new Error(`Opération impossible : le compte est ${comptes[index].statut}`);
    }

    comptes[index].solde += montant;

    const transaction = {
        type: 'depot',
        montant,
        date: new Date(),
        soldeApres: comptes[index].solde
    };

    comptes[index].transactions.push(transaction);
    sauvegarderComptes(comptes);
    return { compte: comptes[index], transaction };
};

const retirer = (id, montant) => {
    if (!montant || montant <= 0) {
        throw new Error('Le montant doit être supérieur à 0');
    }

    const comptes = lireComptes();
    const index = comptes.findIndex(c => c.id === parseInt(id));

    if (comptes[index].statut !== 'actif') {
        throw new Error(`Opération impossible : le compte est ${comptes[index].statut}`);
    }

    if (comptes[index].solde < montant) {
        throw new Error(`Solde insuffisant (${comptes[index].solde} FCFA)`);
    }

    comptes[index].solde -= montant;

    const transaction = {
        type: 'retrait',
        montant,
        date: new Date(),
        soldeApres: comptes[index].solde
    };

    comptes[index].transactions.push(transaction);
    sauvegarderComptes(comptes);
    return { compte: comptes[index], transaction };
};

const transferer = (expediteurId, destinataireId, montant) => {
    if (!expediteurId || !destinataireId || !montant || montant <= 0) {
        throw new Error('expediteurId, destinataireId et montant (>0) sont obligatoires');
    }

    const comptes = lireComptes();
    const indexExp = comptes.findIndex(c => c.id === parseInt(expediteurId));
    const indexDest = comptes.findIndex(c => c.id === parseInt(destinataireId));
    const indexBanque = comptes.findIndex(c => c.id === 0);

    if (indexExp === -1) throw new Error('Compte expéditeur introuvable');
    if (indexDest === -1) throw new Error('Compte destinataire introuvable');
    if (indexExp === indexDest) throw new Error('Expéditeur et destinataire doivent être différents');

    if (comptes[indexExp].statut !== 'actif') {
        throw new Error(`Transfert impossible : le compte expéditeur est ${comptes[indexExp].statut}`);
    }

    if (comptes[indexDest].statut !== 'actif') {
        throw new Error(`Transfert impossible : le compte destinataire est ${comptes[indexDest].statut}`);
    }

    // Calcul des frais (1%)
    const frais = Math.round(montant * 0.01);
    const totalADebiter = montant + frais;

    if (comptes[indexExp].solde < totalADebiter) {
        throw new Error(`Solde insuffisant pour couvrir le transfert et les frais (${frais} FCFA). Total nécessaire: ${totalADebiter} FCFA`);
    }

    // Débit expéditeur (Montant + Frais)
    comptes[indexExp].solde -= totalADebiter;
    comptes[indexExp].transactions.push({
        type: 'transfert_envoye',
        vers: destinataireId,
        montant,
        frais,
        date: new Date(),
        soldeApres: comptes[indexExp].solde
    });

    // Crédit destinataire (Montant uniquement)
    comptes[indexDest].solde += montant;
    comptes[indexDest].transactions.push({
        type: 'transfert_recu',
        de: expediteurId,
        montant,
        date: new Date(),
        soldeApres: comptes[indexDest].solde
    });

    // Crédit Banque (Frais uniquement)
    if (indexBanque !== -1) {
        comptes[indexBanque].solde += frais;
        comptes[indexBanque].transactions.push({
            type: 'commission_transfert',
            de: expediteurId,
            vers: destinataireId,
            montantOriginal: montant,
            frais,
            date: new Date(),
            soldeApres: comptes[indexBanque].solde
        });
    }

    sauvegarderComptes(comptes);
    return { freshExpediteur: comptes[indexExp], frais };
};

const getTransactions = (id) => {
    const compte = getCompte(id);
    if (!compte) throw new Error('Compte introuvable');
    return compte.transactions;
};

const supprimerCompte = (id) => {
    const targetId = parseInt(id);
    if (targetId === 0) {
        throw new Error('Impossible de supprimer le compte BANQUE CENTRALE');
    }

    const comptes = lireComptes();
    const index = comptes.findIndex(c => c.id === targetId);

    if (index === -1) {
        throw new Error('Compte introuvable');
    }

    const compteSupprime = comptes.splice(index, 1)[0];
    sauvegarderComptes(comptes);
    return compteSupprime;
};

const changerStatut = (id, nouveauStatut) => {
    const comptes = lireComptes();
    const index = comptes.findIndex(c => c.id === parseInt(id));

    if (index === -1) {
        throw new Error('Compte introuvable');
    }

    if (!['actif', 'suspendu', 'fermé'].includes(nouveauStatut)) {
        throw new Error('Statut invalide (doit être actif, suspendu ou fermé)');
    }

    comptes[index].statut = nouveauStatut;
    sauvegarderComptes(comptes);
    return comptes[index];
};

module.exports = {
    creerCompte,
    getComptes,
    getCompte,
    deposer,
    retirer,
    transferer,
    getTransactions,
    supprimerCompte,
    changerStatut
};
