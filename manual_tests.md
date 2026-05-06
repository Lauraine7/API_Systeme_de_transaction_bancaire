# Cahier de Tests Manuels - API Bancaire Multibanque

Ce document définit les protocoles de tests manuels pour valider les fonctionnalités du système ICT304.

---

## TM_01 : Création de Compte (Multi-institution)
*   **Objectif** : Vérifier que le système crée correctement un compte associé à une banque spécifique.
*   **Pré-requis** : Interface CLI ou Swagger lancée.
*   **Étapes** :
    1. Sélectionner l'option de création de compte.
    2. Saisir un nom, prénom et email valide.
    3. Choisir le code banque `ECO`.
*   **Résultat Attendu** : Le système confirme la création et affiche un ID unique ainsi que le libellé `[ECO]`.

---

## TM_02 : Opérations de Dépôt
*   **Objectif** : Valider le crédit en temps réel sur un compte existant.
*   **Pré-requis** : Disposer de l'ID d'un compte actif.
*   **Étapes** :
    1. Sélectionner l'option **Effectuer un dépôt**.
    2. Saisir l'ID du compte et un montant de `5000`.
*   **Résultat Attendu** : Le solde du compte augmente de 5000. Une transaction de type `depot` est générée dans l'historique.

---

## TM_03 : Retrait de Fonds (Contrôle Solde)
*   **Objectif** : Vérifier que le retrait débite le solde et bloque les découverts non autorisés.
*   **Étapes** :
    1. Tenter de retirer `1000000` sur un compte ayant un solde de `5000`.
    2. Tenter ensuite un retrait de `2000`.
*   **Résultat Attendu** : 
    - Le premier essai échoue avec le message "Solde insuffisant".
    - Le second essai réussit et le solde passe à `2980` (débit de 2000 + 1% de frais = 2020).
    - La Banque Centrale est créditée de `20` de frais.

---

## TM_04 : Transfert Inter-banque (Commission)
*   **Objectif** : Valider le calcul automatique de la commission de 1% entre deux banques.
*   **Pré-requis** : Un compte `UBA` (expéditeur) et un compte `AFB` (destinataire).
*   **Étapes** :
    1. Initier un transfert de `1000` de UBA vers AFB.
*   **Résultat Attendu** : 
    - L'expéditeur est débité de `1010` (1000 + 1%).
    - Le destinataire reçoit `1000`.
    - La Banque Centrale (ID 0) reçoit `10` de commission.

---

## TM_05 : Suppression de Compte (Sécurité)
*   **Objectif** : Vérifier la clôture définitive d'un compte et la protection des comptes systèmes.
*   **Étapes** :
    1. Tenter de supprimer le compte ID `0`.
    2. Supprimer un compte client classique créé pour le test.
*   **Résultat Attendu** :
    - La suppression de l'ID 0 est refusée ("Compte protégé").
    - La suppression du compte client réussit et il disparaît de la liste globale.

---
**Validé par :** [ATIWA KUETE Elsa Lauraine 23V2352]  
**Date de validation :** 22/04/2026
