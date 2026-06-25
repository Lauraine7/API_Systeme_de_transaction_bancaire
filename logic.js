const prisma = require('./prismaClient');

const BANQUES_SUPPORTEES = ['UBA', 'ECO', 'AFB', 'BIC'];
const BANQUE_DEFAUT = 'UBA';

/**
 * Initialisation : Assure que le compte banquier (Banque Centrale) existe en DB.
 * Appelé au démarrage ou lors du premier accès.
 */
const assurerBanqueCentrale = async () => {
    let banqueCentrale = await prisma.account.findUnique({ where: { id: 0 } });
    if (!banqueCentrale) {
        banqueCentrale = await prisma.account.create({
            data: {
                id: 0,
                nom: "BANQUE",
                prenom: "CENTRALE",
                email: "banque@system.com",
                typeCompte: "service",
                codeBanque: "CENTRAL",
                solde: 0,
                statut: "actif"
            }
        });
    }
    return banqueCentrale;
};

const creerCompte = async (nom, prenom, email, typeCompte = 'courant', codeBanque = BANQUE_DEFAUT, userId = null) => {
    // Validation du code banque
    if (!BANQUES_SUPPORTEES.includes(codeBanque)) {
        throw new Error(`Banque non supportée. Banques valides : ${BANQUES_SUPPORTEES.join(', ')}`);
    }

    // Validation du type de compte
    if (!typeCompte) {
        typeCompte = 'courant';
    } else if (!['courant', 'epargne'].includes(typeCompte)) {
        throw new Error('Type de compte invalide (doit être courant ou epargne)');
    }

    const emailExiste = await prisma.account.findUnique({ where: { email } });
    if (emailExiste) {
        throw new Error('Un compte avec cet email existe déjà');
    }

    return await prisma.account.create({
        data: {
            nom,
            prenom,
            email,
            typeCompte,
            codeBanque,
            solde: 0,
            statut: 'actif',
            userId: userId ? parseInt(userId) : null
        }
    });
};

const getComptes = async () => {
    await assurerBanqueCentrale();
    return await prisma.account.findMany();
};

const getCompte = async (id) => {
    return await prisma.account.findUnique({
        where: { id: parseInt(id) },
        include: { transactions: true }
    });
};

const deposer = async (id, montant) => {
    if (!montant || montant <= 0) {
        throw new Error('Le montant doit être supérieur à 0');
    }

    return await prisma.$transaction(async (tx) => {
        const compte = await tx.account.findUnique({ where: { id: parseInt(id) } });

        if (!compte) throw new Error('Compte introuvable');
        if (compte.statut !== 'actif') throw new Error(`Opération impossible : le compte est ${compte.statut}`);

        const updatedCompte = await tx.account.update({
            where: { id: compte.id },
            data: { solde: { increment: montant } }
        });

        const transaction = await tx.transaction.create({
            data: {
                type: 'depot',
                montant,
                soldeApres: updatedCompte.solde,
                accountId: compte.id
            }
        });

        return { compte: updatedCompte, transaction };
    });
};

const retirer = async (id, montant) => {
    if (!montant || montant <= 0) {
        throw new Error('Le montant doit être supérieur à 0');
    }

    return await prisma.$transaction(async (tx) => {
        const compte = await tx.account.findUnique({ where: { id: parseInt(id) } });
        const banque = await tx.account.findUnique({ where: { id: 0 } });

        if (!compte) throw new Error('Compte introuvable');
        if (compte.statut !== 'actif') throw new Error(`Opération impossible : le compte est ${compte.statut}`);

        const frais = Math.round(montant * 0.01);
        const totalADebiter = montant + frais;

        if (compte.solde < totalADebiter) {
            throw new Error(`Solde insuffisant (Nécessaire: ${totalADebiter} FCFA, Solde: ${compte.solde} FCFA)`);
        }

        // Débit client
        const updatedCompte = await tx.account.update({
            where: { id: compte.id },
            data: { solde: { decrement: totalADebiter } }
        });

        const transaction = await tx.transaction.create({
            data: {
                type: 'retrait',
                montant,
                frais,
                soldeApres: updatedCompte.solde,
                accountId: compte.id
            }
        });

        // Crédit Banque
        if (banque) {
            const updatedBanque = await tx.account.update({
                where: { id: 0 },
                data: { solde: { increment: frais } }
            });

            await tx.transaction.create({
                data: {
                    type: 'commission_retrait',
                    montant: frais,
                    montantOriginal: montant,
                    frais,
                    soldeApres: updatedBanque.solde,
                    accountId: 0,
                    expediteurId: compte.id
                }
            });
        }

        return { compte: updatedCompte, transaction, frais };
    });
};

const transferer = async (expediteurId, destinataireId, montant) => {
    if (expediteurId == null || destinataireId == null || !montant || montant <= 0) {
        throw new Error('expediteurId, destinataireId et montant (>0) sont obligatoires');
    }

    return await prisma.$transaction(async (tx) => {
        const exp = await tx.account.findUnique({ where: { id: parseInt(expediteurId) } });
        const dest = await tx.account.findUnique({ where: { id: parseInt(destinataireId) } });
        const banque = await tx.account.findUnique({ where: { id: 0 } });

        if (!exp) throw new Error('Compte expéditeur introuvable');
        if (!dest) throw new Error('Compte destinataire introuvable');
        if (exp.id === dest.id) throw new Error('Expéditeur et destinataire doivent être différents');

        if (exp.statut !== 'actif') throw new Error(`Transfert impossible : le compte expéditeur est ${exp.statut}`);
        if (dest.statut !== 'actif') throw new Error(`Transfert impossible : le compte destinataire est ${dest.statut}`);

        const estInterBanque = exp.codeBanque !== dest.codeBanque;
        const frais = estInterBanque ? Math.round(montant * 0.01) : 0;
        const totalADebiter = montant + frais;

        if (exp.solde < totalADebiter) {
            const msgFrais = estInterBanque ? ` (incluant ${frais} FCFA de frais inter-banque)` : '';
            throw new Error(`Solde insuffisant pour couvrir le transfert${msgFrais}. Total nécessaire: ${totalADebiter} FCFA`);
        }

        const typeTransfert = estInterBanque ? 'transfert_inter' : 'transfert_intra';

        // Débit Expéditeur
        const freshExp = await tx.account.update({
            where: { id: exp.id },
            data: { solde: { decrement: totalADebiter } }
        });

        await tx.transaction.create({
            data: {
                type: typeTransfert + '_envoye',
                montant,
                frais,
                soldeApres: freshExp.solde,
                accountId: exp.id,
                destinataireId: dest.id,
                banqueTiers: dest.codeBanque
            }
        });

        // Crédit Destinataire
        const freshDest = await tx.account.update({
            where: { id: dest.id },
            data: { solde: { increment: montant } }
        });

        await tx.transaction.create({
            data: {
                type: typeTransfert + '_recu',
                montant,
                soldeApres: freshDest.solde,
                accountId: dest.id,
                expediteurId: exp.id,
                banqueTiers: exp.codeBanque
            }
        });

        // Commission Banque
        if (frais > 0 && banque) {
            const freshBanque = await tx.account.update({
                where: { id: 0 },
                data: { solde: { increment: frais } }
            });

            await tx.transaction.create({
                data: {
                    type: 'commission_transfert',
                    montant: frais,
                    montantOriginal: montant,
                    frais,
                    soldeApres: freshBanque.solde,
                    accountId: 0,
                    expediteurId: exp.id,
                    destinataireId: dest.id
                }
            });
        }

        return { freshExpediteur: freshExp, frais };
    });
};

const getTransactions = async (id) => {
    const acc = await prisma.account.findUnique({ where: { id: parseInt(id) } });
    if (!acc) throw new Error('Compte introuvable');
    return await prisma.transaction.findMany({
        where: { accountId: acc.id },
        orderBy: { date: 'desc' }
    });
};

const supprimerCompte = async (id) => {
    const targetId = parseInt(id);
    if (targetId === 0) throw new Error('Impossible de supprimer le compte BANQUE CENTRALE');

    const acc = await prisma.account.findUnique({ where: { id: targetId } });
    if (!acc) throw new Error('Compte introuvable');

    // Supprimer les transactions d'abord (contrainte intégrité)
    await prisma.transaction.deleteMany({ where: { accountId: targetId } });
    return await prisma.account.delete({ where: { id: targetId } });
};

const changerStatut = async (id, nouveauStatut) => {
    if (!['actif', 'suspendu', 'fermé'].includes(nouveauStatut)) {
        throw new Error('Statut invalide (doit être actif, suspendu ou fermé)');
    }

    return await prisma.account.update({
        where: { id: parseInt(id) },
        data: { statut: nouveauStatut }
    });
};

const modifierCompte = async (id, data) => {
    const acc = await prisma.account.findUnique({ where: { id: parseInt(id) } });
    if (!acc) throw new Error('Compte introuvable');
    return await prisma.account.update({
        where: { id: acc.id },
        data: data
    });
};

const getStatistiques = async () => {
    const totalComptes = await prisma.account.count();
    const totalTransactions = await prisma.transaction.count();
    const totalSolde = await prisma.account.aggregate({
        _sum: { solde: true }
    });
    
    return {
        totalComptes,
        totalTransactions,
        soldeTotal: totalSolde._sum.solde || 0
    };
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
    changerStatut,
    modifierCompte,
    getStatistiques,
    BANQUES_SUPPORTEES
};

