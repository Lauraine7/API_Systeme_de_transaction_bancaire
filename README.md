# 🏦 API Bancaire Mobile — ICT304

API REST développée avec **Node.js + Express.js** permettant la gestion de comptes bancaires mobiles, avec une interface de commande (CLI) et une documentation Swagger complète.

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
| POST | `/api/comptes` | Créer un compte (`nom`, `prenom`, `email`, `typeCompte`) |
| GET | `/api/comptes` | Lister tous les comptes |
| GET | `/api/comptes/:id` | Détail d'un compte |
| POST | `/api/comptes/:id/depot` | Effectuer un dépôt |
| POST | `/api/comptes/:id/retrait` | Effectuer un retrait |
| POST | `/api/transfert` | Transférer de l'argent (Frais 1%) |
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

## 🛠️ Stack technique

- **Runtime** : Node.js v22
- **Framework** : Express.js 5
- **Documentation** : Swagger (swagger-jsdoc & swagger-ui-express)
- **Stockage** : Local (fichier `comptes.json`)
- **Devise** : FCFA

---

*ICT304 — Système de Transaction Bancaire Mobile | ATIWA KUETE Elsa Lauraine — 23V2352*
