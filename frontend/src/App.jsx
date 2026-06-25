import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useApp, AppProvider } from './context/AppContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const AppContent = () => {
  const [showRegister, setShowRegister] = useState(false);
  const { theme, t, user, isAdmin } = useApp();
  const [comptes, setComptes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComptes = async () => {
    try {
      setLoading(true);
      // Pour les admins, on récupère tous les comptes via l'endpoint admin
      const url = isAdmin ? `${API_URL}/admin/comptes` : `${API_URL}/comptes`;
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      };
      const res = await axios.get(url, config);
      setComptes(res.data);
      setError(null);
    } catch (err) {
      console.error('API Error:', err);
      // Si on n'est pas admin, on n'affiche peut-être qu'un seul compte
      if (!isAdmin && user?.accountId) {
        try {
          const res = await axios.get(`${API_URL}/comptes/${user.accountId}`);
          setComptes({ comptes: [res.data.compte] });
          setError(null);
          return;
        } catch (e) { console.error(e); }
      }
      setError('Erreur de connexion à l\'API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchComptes();
  }, [user]);

  if (!user) {
    if (showRegister) return <Register onShowLogin={() => setShowRegister(false)} />;
    return <Login onShowRegister={() => setShowRegister(true)} />;
  }

  return (
    <div className={`app ${theme}`}>
      <Header />
      <main className="container fade-in" style={{ paddingBottom: '5rem' }}>
        {isAdmin && <AdminDashboard refresh={fetchComptes} />}
        
        {loading ? (
          <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: '30px', margin: '2rem 0' }}>
            <div className="loading-spinner"></div>
            <p style={{ marginTop: '1rem', opacity: 0.6 }}>{t('loading')}</p>
          </div>
        ) : (
          <Dashboard comptes={comptes.comptes || comptes || []} refresh={fetchComptes} />
        )}
      </main>
    </div>
  );
};

const App = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
