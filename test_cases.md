# Cas de Tests Techniques - API Bancaire Multibanque

Ce document présente les cas de tests pour les 5 fonctionnalités clés du système.

---

## 1. Création de Compte
| ID | Description | Entrées (Input) | Résultat Attendu | Type |
|---|---|---|---|---|
| TC_01_01 | Création valide | Nom, Prénom, Email, Banque: "UBA" | Code 201, Compte créé avec `codeBanque: UBA` | Fonctionnel |
| TC_01_02 | Email en double | Email déjà existant | Code 409, Erreur "Email déjà existant" | Fonctionnel |
| TC_01_03 | Banque non supportée | Banque: "SGC" | Code 400, Erreur "Banque non supportée" | Non-fonctionnel |
| TC_01_04 | Champs manquants | Nom: null | Code 400, Erreur "Champs obligatoires" | Fonctionnel |

---

## 2. Dépôt de Fonds
| ID | Description | Entrées | Résultat Attendu | Type |
|---|---|---|---|---|
| TC_02_01 | Dépôt valide | ID: X, Montant: 5000 | Code 200, Solde mis à jour, Nouveau dépôt en historique | Fonctionnel |
| TC_02_02 | Montant négatif | Montant: -100 | Code 400, Erreur "Montant doit être > 0" | Non-fonctionnel |
| TC_02_03 | Compte suspendu | ID d'un compte suspendu | Code 400, Erreur "Le compte est suspendu" | Fonctionnel |

---

## 3. Retrait de Fonds
| ID | Description | Entrées | Résultat Attendu | Type |
|---|---|---|---|---|
| TC_03_01 | Retrait valide | ID: X, Montant: 2000 | Code 200, Solde débité de 2020 (montant + 1% frais), Nouveau retrait en historique, Banque Centrale reçoit 1% | Fonctionnel |
| TC_03_02 | Solde insuffisant | (Montant + 1%) > Solde | Code 422, Erreur "Solde insuffisant" | Fonctionnel |

---

## 4. Transferts (Intra vs Inter)
| ID | Description | Scénario | Résultat Attendu | Type |
|---|---|---|---|---|
| TC_04_01 | Transfert Intra-banque | Exp (UBA) -> Dest (UBA) | Frais: **0 FCFA**. Seul le montant est débité. | Fonctionnel |
| TC_04_02 | Transfert Inter-banque | Exp (UBA) -> Dest (ECO) | Frais: **1%**. Exp débité de Montant + 1%. | Fonctionnel |
| TC_04_03 | Commission Centrale | Inter-banque | Le compte ID 0 (CENTRAL) reçoit les 1% de frais. | Fonctionnel |
| TC_04_04 | Solde vs Frais | Solde exact pour montant mais pas frais | Code 422, Solde insuffisant (incluant frais inter) | Fonctionnel |

---

## 5. Suppression de Compte
| ID | Description | Entrées | Résultat Attendu | Type |
|---|---|---|---|---|
| TC_06_01 | Suppression valide | ID d'un compte existant | Code 200, Compte supprimé | Fonctionnel |
| TC_06_02 | Compte inexistant | ID qui n'existe pas | Code 404, Erreur "Compte introuvable" | Fonctionnel |
| TC_06_03 | Compte avec solde | ID d'un compte avec solde > 0 | Code 400, Erreur "Solde non nul" | Fonctionnel |
| TC_06_04 | Supprimer ID 0 | ID: 0 (Banque Centrale) | Code 403, Erreur "Compte protégé" | Non-fonctionnel |
