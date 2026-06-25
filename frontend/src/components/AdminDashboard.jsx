import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import {
  Users, Activity, DollarSign, ShieldAlert,
  LogOut, TrendingUp, CreditCard, RefreshCw
} from 'lucide-react';
import OperationModal from './OperationModal';

const AdminDashboard = ({ refresh }) => {
  const { t, theme, token, logout, isSuperAdmin } = useApp();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const isDark = theme === 'dark';

  const fetchStatsAndLists = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [statsRes, usersRes, adminsRes] = await Promise.all([
        axios.get('http://localhost:4000/admin/statistiques', config),
        axios.get('http://localhost:4000/admin/comptes?type=USER', config),
        axios.get('http://localhost:4000/admin/comptes?type=ADMIN', config)
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setAdmins(adminsRes.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatsAndLists(); }, []);

  const handleRefresh = () => { setLoading(true); fetchStatsAndLists(); refresh(); };

  const statCards = [
    {
      label: 'Comptes Totaux',
      value: stats?.totalComptes ?? '—',
      icon: <Users size={22} />,
      color: '#00ced1',
      bg: 'rgba(0,206,209,0.08)',
    },
    {
      label: 'Transactions',
      value: stats?.totalTransactions ?? '—',
      icon: <Activity size={22} />,
      color: '#20b2aa',
      bg: 'rgba(32,178,170,0.08)',
    },
    {
      label: 'Solde Système',
      value: stats?.soldeTotal != null ? `${stats.soldeTotal.toLocaleString()} FCFA` : '—',
      icon: <DollarSign size={22} />,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)',
    },
    {
      label: 'Comptes Actifs',
      value: stats?.comptesActifs ?? '—',
      icon: <TrendingUp size={22} />,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.08)',
    },
  ];

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '1.5rem', padding: '0 0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{
            padding: '0.6rem', background: 'rgba(239,68,68,0.08)',
            borderRadius: '12px', border: '1px solid rgba(239,68,68,0.15)'
          }}>
            <ShieldAlert color="#ef4444" size={22} />
          </div>
          <div>
            <h2 style={{
              fontSize: '1.4rem', fontWeight: 900,
              color: isDark ? '#f0fafa' : '#1a2f2f', letterSpacing: '-0.03em'
            }}>
              {t('adminPanel')}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
              Vue d'ensemble du système
            </p>
          </div>
        </div>

        {/* Controls: Add Admin + Refresh + Logout */}
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          {isSuperAdmin && (
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary"
              style={{ padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 600, background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
            >
              <Users size={16} /> {t('addAdmin')}
            </button>
          )}
          <button
            onClick={handleRefresh}
            className="glass"
            style={{ padding: '0.5rem 1rem', gap: '0.5rem', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 600 }}
          >
            <RefreshCw size={16} /> Actualiser
          </button>
          <button
            onClick={logout}
            className="logout-btn"
          >
            <LogOut size={16} />
            {t('logout')}
          </button>
        </div>
      </div>

      {modalOpen && (
        <OperationModal 
          type="createAdmin" 
          onClose={() => setModalOpen(false)} 
          onSuccess={() => { setModalOpen(false); handleRefresh(); }}
        />
      )}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`glass fade-in stagger-${(i % 3) + 1}`}
            style={{
              padding: '1.5rem', borderRadius: '20px',
              background: isDark ? 'rgba(15,25,25,0.5)' : 'rgba(255,255,255,0.8)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {card.label}
                </p>
                <p style={{ fontSize: '1.7rem', fontWeight: 900, color: isDark ? '#f0fafa' : '#1a2f2f', letterSpacing: '-0.03em' }}>
                  {loading ? '...' : card.value}
                </p>
              </div>
              <div style={{ padding: '0.7rem', background: card.bg, borderRadius: '14px' }}>
                <span style={{ color: card.color }}>{card.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Management Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        {/* Users Section */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} /> Utilisateurs
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto', padding: '0.5rem' }}>
            {users.map(compte => (
              <AccountCard 
                key={compte.id} 
                compte={compte} 
                onDelete={async (id) => { await axios.delete(`http://localhost:4000/admin/comptes/${id}`, { headers: { Authorization: `Bearer ${token}` } }); handleRefresh(); }}
                onStatusChange={async (id, s) => { await axios.patch(`http://localhost:4000/admin/comptes/${id}`, { statut: s }, { headers: { Authorization: `Bearer ${token}` } }); handleRefresh(); }}
              />
            ))}
          </div>
        </div>

        {/* Admins Section */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} /> Administrateurs
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto', padding: '0.5rem' }}>
            {admins.map(compte => (
              <AccountCard 
                key={compte.id} 
                compte={compte} 
                onDelete={async (id) => { await axios.delete(`http://localhost:4000/admin/comptes/${id}`, { headers: { Authorization: `Bearer ${token}` } }); handleRefresh(); }}
                onStatusChange={async (id, s) => { await axios.patch(`http://localhost:4000/admin/comptes/${id}`, { statut: s }, { headers: { Authorization: `Bearer ${token}` } }); handleRefresh(); }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
