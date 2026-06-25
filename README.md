# 🏦 API Bancaire Multibanque — ICT304

API REST développée avec **Node.js + Express.js** permettant la gestion de comptes sur plusieurs institutions financières, avec transferts interbancaires et commissions centralisées.

---

## 🚀 Démarrage

### 1. Installation
```bash
# Installer les dépendances
npm install
```

### 2. Lancer le serveur (API)
```bash
# Lancer le serveur
npm start
```
Le serveur démarre sur : **http://localhost:4000**

### 3. Lancer l'interface Menu (CLI)
```bash
# Lancer le menu interactif
node menu.js
```

---

## 📖 Documentation Swagger
Une documentation interactive est disponible pour tester toutes les routes de l'API sans outils externes.

*   **Local** : `http://localhost:4000/api-docs`
*   **Production** : `https://api-systeme-de-transaction.onrender.com/api-docs`

---

## 📋 Liste des endpoints

| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Message de bienvenue |
| GET | `/api-docs` | **Documentation Swagger** |
| POST | `/api/comptes` | Créer un compte (`nom`, `prenom`, `email`, `typeCompte`, `codeBanque`) |
| GET | `/api/comptes` | Lister tous les comptes (avec banque) |
| GET | `/api/comptes/:id` | Détail d'un compte |
| POST | `/api/comptes/:id/depot` | Effectuer un dépôt |
| POST | `/api/comptes/:id/retrait` | Effectuer un retrait |
| POST | `/api/transfert` | Transférer (Gratuit intra-banque, 1% inter-banque) |
| GET | `/api/comptes/:id/transactions` | Historique des transactions |
| PATCH | `/api/comptes/:id/statut` | Changer le statut (actif, suspendu, fermé) |
| DELETE | `/api/comptes/:id` | Supprimer un compte |

---

## 🌍 Déploiement
Cette API est configurée pour être déployée sur **Render**.
- **Build Command** : `npm install`
- **Start Command** : `npm start`
- **Var d'environnement** : `PORT` (géré automatiquement par Render)

---

## 🏦 Banques Supportées
L'API accepte les codes banques suivants :
- `UBA` : United Bank for Africa
- `ECO` : Ecobank
- `AFB` : Afriland First Bank
- `BIC` : Bicec

## ⚖️ Règles Financières
- **Retrait** : Frais de **1%** sur le montant du retrait, applicables à toutes les banques.
- **Transfert Intra-banque** : Gratuit (0 FCFA de commission).
- **Transfert Inter-banque** : Frais de **1%**, prélevés sur le compte expéditeur et reversés à la **Banque Centrale (ID 0)**.

---

## 🛠️ Stack technique
- **Runtime** : Node.js v22
- **Framework** : Express.js 5
- **Documentation** : Swagger (swagger-jsdoc & swagger-ui-express)
- **Stockage** : Local (fichier `comptes.json`)
- **Devise** : FCFA

---
*Accueil de l'API : https://api-systeme-de-transaction-bancaire.onrender.com
Documentation interactive (Swagger UI) : https://api-systeme-de-transaction-bancaire.onrender.com/api-docs
*ICT304 — Système de Transaction Bancaire Mobile | ATIWA KUETE Elsa Lauraine — 23V2352   
https://api-systeme-de-transaction-bancaire.onrender.com*
