import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'fr');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => { localStorage.setItem('theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('lang', lang); }, [lang]);
  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);
  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  const login = (userData, userToken) => { setUser(userData); setToken(userToken); };
  const logout = () => { setUser(null); setToken(null); };
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const translations = {
    fr: {
      appName: 'AKEL Banque',
      welcome: 'Bienvenue chez AKEL',
      dashboard: 'Tableau de bord',
      accounts: 'Mes Comptes',
      transactions: 'Historique',
      newAccount: 'Ouvrir un compte',
      deposit: 'Dépôt',
      withdraw: 'Retrait',
      transfer: 'Transfert',
      balance: 'Solde',
      status: 'Statut',
      type: 'Type',
      actions: 'Actions',
      date: 'Date',
      amount: 'Montant',
      fees: 'Frais',
      from: 'De',
      to: 'Vers',
      confirm: 'Confirmer',
      cancel: 'Annuler',
      loading: 'Chargement...',
      delete: 'Supprimer',
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer ce compte ?',
      deleteWarning: 'Cette action est irréversible.',
      changeStatus: 'Changer le Statut',
      active: 'Actif',
      suspended: 'Suspendu',
      closed: 'Fermé',
      actif: 'Actif',
      suspendu: 'Suspendu',
      'fermé': 'Fermé',
      success: 'Opération réussie',
      error: 'Une erreur est survenue',
      login: 'Connexion',
      signup: 'Inscription',
      logout: 'Déconnexion',
      email: 'Email',
      password: 'Mot de passe',
      role: 'Rôle',
      adminPanel: 'Panneau Admin',
      noAccount: 'Pas encore de compte ?',
      hasAccount: 'Déjà un compte ?',
      welcomeBack: 'Bienvenue à nouveau 👋',
      noAccounts: 'Aucun compte',
      firstName: 'Prénom',
      lastName: 'Nom',
      accountType: 'Type de compte',
      bankCode: 'Code Banque',
      current: 'Courant',
      savings: 'Épargne',
      addAdmin: 'Ajouter un Admin',
      createAdminSuccess: 'Administrateur créé avec succès',
    },
    en: {
      appName: 'AKEL Bank',
      welcome: 'Welcome to AKEL',
      dashboard: 'Dashboard',
      accounts: 'My Accounts',
      transactions: 'History',
      newAccount: 'Open Account',
      deposit: 'Deposit',
      withdraw: 'Withdraw',
      transfer: 'Transfer',
      balance: 'Balance',
      status: 'Status',
      type: 'Type',
      actions: 'Actions',
      date: 'Date',
      amount: 'Amount',
      fees: 'Fees',
      from: 'From',
      to: 'To',
      confirm: 'Confirm',
      cancel: 'Cancel',
      loading: 'Loading...',
      delete: 'Delete',
      deleteConfirm: 'Are you sure you want to delete this account?',
      deleteWarning: 'This action cannot be undone.',
      changeStatus: 'Change Status',
      active: 'Active',
      suspended: 'Suspended',
      closed: 'Closed',
      actif: 'Active',
      suspendu: 'Suspended',
      'fermé': 'Closed',
      success: 'Operation successful',
      error: 'An error occurred',
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      role: 'Role',
      adminPanel: 'Admin Panel',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      welcomeBack: 'Welcome back 👋',
      noAccounts: 'No accounts',
      firstName: 'First Name',
      lastName: 'Last Name',
      accountType: 'Account Type',
      bankCode: 'Bank Code',
      current: 'Current',
      savings: 'Savings',
    }
  };

  const t = (key) => translations[lang][key] || key;

  return (
    <AppContext.Provider value={{
      theme, toggleTheme, lang, setLang, t,
      user, token, login, logout, 
      isAdmin: ['ADMIN', 'SUPERADMIN'].includes(user?.role?.toUpperCase()),
      isSuperAdmin: user?.role?.toUpperCase() === 'SUPERADMIN'
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
