# 🏦 API Bancaire Mobile — ICT304

API REST développée avec **Node.js + Express.js** permettant la gestion de comptes bancaires mobiles.

---

## 🚀 Démarrage

```bash
# Installer les dépendances
npm install

# Lancer le serveur
node index.js
```

Le serveur démarre sur : **http://localhost:4000**

---

## 📋 Liste des endpoints

| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Message de bienvenue |
| POST | `/api/comptes` | Créer un compte |
| GET | `/api/comptes` | Lister tous les comptes |
| GET | `/api/comptes/:id` | Détail d'un compte |
| POST | `/api/comptes/:id/depot` | Effectuer un dépôt |
| POST | `/api/comptes/:id/retrait` | Effectuer un retrait |
| POST | `/api/transfert` | Transférer de l'argent |
| GET | `/api/comptes/:id/transactions` | Historique des transactions |

---

## 🧪 Commandes de test

### ✅ Tester que le serveur tourne
```bash
curl http://localhost:4000
```

---

### 👤 Créer un compte
```bash
curl -X POST http://localhost:4000/api/comptes \
-H "Content-Type: application/json" \
-d '{"nom": "Kuete", "prenom": "Elsa", "email": "elsa@email.com"}'
```

---

### 💰 Effectuer un dépôt
```bash
curl -X POST http://localhost:4000/api/comptes/1/depot \
-H "Content-Type: application/json" \
-d '{"montant": 5000}'
```
**Réponse :** `"nouveauSolde": "5000 FCFA"`

---

### 💸 Effectuer un retrait
```bash
curl -X POST http://localhost:4000/api/comptes/1/retrait \
-H "Content-Type: application/json" \
-d '{"montant": 2000}'
```

---

### 🔄 Transférer de l'argent
```bash
curl -X POST http://localhost:4000/api/transfert \
-H "Content-Type: application/json" \
-d '{"expediteurId": 1, "destinataireId": 2, "montant": 1000}'
```
> [!NOTE]
> Des frais de **1%** sont appliqués sur chaque transfert et sont débités de l'expéditeur.

---

## 🛠️ Stack technique

- **Runtime** : Node.js v22
- **Framework** : Express.js 5
- **Stockage** : Local (fichier `comptes.json`)
- **Devise** : FCFA
- **Format** : JSON

---

*ICT304 — Système de Transaction Bancaire Mobile | ATIWA KUETE Elsa Lauraine — 23V2352*
