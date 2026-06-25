const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const DB_FILE = path.join(__dirname, 'comptes.json');

async function migrate() {
  console.log('🚀 Démarrage de la migration des données...');

  if (!fs.existsSync(DB_FILE)) {
    console.error('❌ Fichier comptes.json introuvable.');
    return;
  }

  const data = fs.readFileSync(DB_FILE, 'utf8');
  const comptesJson = JSON.parse(data);

  for (const c of comptesJson) {
    console.log(`Migrating account: ${c.email}...`);
    
    // Création du compte
    const account = await prisma.account.upsert({
      where: { email: c.email },
      update: {
        nom: c.nom,
        prenom: c.prenom,
        typeCompte: c.typeCompte,
        codeBanque: c.codeBanque || 'UBA',
        solde: c.solde,
        statut: c.statut,
        dateCreation: new Date(c.dateCreation)
      },
      create: {
        id: c.id,
        nom: c.nom,
        prenom: c.prenom,
        email: c.email,
        typeCompte: c.typeCompte,
        codeBanque: c.codeBanque || 'UBA',
        solde: c.solde,
        statut: c.statut,
        dateCreation: new Date(c.dateCreation)
      }
    });

    // Migration des transactions
    if (c.transactions && c.transactions.length > 0) {
      for (const t of c.transactions) {
        await prisma.transaction.create({
          data: {
            type: t.type,
            montant: t.montant !== undefined ? t.montant : (t.frais || 0),
            frais: t.frais || 0,
            date: new Date(t.date),
            soldeApres: t.soldeApres,
            accountId: account.id,
            destinataireId: t.vers ? parseInt(t.vers) : null,
            expediteurId: t.de ? parseInt(t.de) : null,
            banqueTiers: t.banqueDest || t.banqueExp || null,
            montantOriginal: t.montantOriginal || null
          }
        });
      }
    }
  }

  console.log('✅ Migration terminée avec succès !');
}

migrate()
  .catch((e) => {
    console.error('❌ Erreur lors de la migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
