import React, { useState } from 'react';
import axios from 'axios';
import { Plus, ArrowUpRight, ArrowDownLeft, Send, Shield, ShieldAlert, ShieldOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import AccountCard from './AccountCard';
import TransactionList from './TransactionList';
import OperationModal from './OperationModal';

const API_URL = 'http://localhost:4000';

const Dashboard = ({ comptes, refresh }) => {
  const { t, isAdmin } = useApp();
  const [selectedAccount, setSelectedAccount] = useState(comptes[1] || comptes[0]);
  const [modalType, setModalType] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleActionComplete = () => {
    setModalType(null);
    refresh();
  };

  const handleDeleteAccount = async (id) => {
    try {
      await axios.delete(`${API_URL}/comptes/${id}`);
      if (selectedAccount?.id === id) setSelectedAccount(null);
      refresh();
    } catch (err) {
      alert(err.response?.data?.erreur || t('error'));
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingStatus(true);
      const url = isAdmin ? `${API_URL}/admin/comptes/${id}` : `${API_URL}/comptes/${id}/statut`;
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      };
      await axios.patch(url, { statut: newStatus }, config);
      refresh();
    } catch (err) {
      alert(err.response?.data?.erreur || t('error'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '2.5rem', padding: '0 1rem' }}>
      {/* Sidebar - Account List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, opacity: 0.9 }}>{t('accounts')}</h2>
          {isAdmin && (
            <button onClick={() => setModalType('create')} className="btn-primary" style={{ padding: '0.6rem', borderRadius: '12px' }}>
              <Plus size={20} />
            </button>
          )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxHeight: '75vh', overflowY: 'auto', padding: '0.5rem' }}>
          {comptes.length === 0 ? (
            <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderRadius: '20px', opacity: 0.6 }}>
              {t('noAccounts')}
            </div>
          ) : (
            comptes.filter(c => c.id !== 0).map((compte, idx) => (
              <div key={compte.id} className={`fade-in stagger-${(idx % 3) + 1}`}>
                <AccountCard 
                  compte={compte} 
                  active={selectedAccount?.id === compte.id}
                  onClick={() => setSelectedAccount(compte)}
                  onDelete={handleDeleteAccount}
                  onStatusChange={handleStatusChange}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content - Active Account Stats & Transactions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {selectedAccount ? (
          <>
            <div className="glass fade-in" style={{ 
              padding: '3rem', 
              borderRadius: '40px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))'
            }}>
              <div style={{ 
                position: 'absolute', top: '-100px', right: '-100px', 
                width: '300px', height: '300px', 
                background: 'radial-gradient(circle, var(--light-primary) 0%, transparent 70%)', 
                opacity: 0.05, pointerEvents: 'none' 
              }} />

              <div>
                <p style={{ opacity: 0.5, marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem', fontWeight: 700 }}>{t('balance')}</p>
                <h1 style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--light-primary)', textShadow: '0 10px 20px rgba(0,206,209,0.2)' }}>
                  {selectedAccount.solde.toLocaleString()} <span style={{ fontSize: '1.8rem', opacity: 0.7 }}>FCFA</span>
                </h1>
                
                {/* Status Switcher - Admin Only */}
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '0.8rem', marginTop: '2rem' }}>
                    <button 
                      disabled={updatingStatus || selectedAccount.statut === 'actif'}
                      onClick={() => handleStatusChange(selectedAccount.id, 'actif')}
                      className="glass" 
                      style={{ 
                        padding: '0.5rem 1rem', fontSize: '0.75rem', borderRadius: '10px',
                        backgroundColor: selectedAccount.statut === 'actif' ? 'rgba(76,175,80,0.1)' : 'transparent',
                        color: selectedAccount.statut === 'actif' ? '#4caf50' : 'inherit'
                      }}
                    >
                      <Shield size={14} /> {t('active')}
                    </button>
                    <button 
                      disabled={updatingStatus || selectedAccount.statut === 'suspendu'}
                      onClick={() => handleStatusChange(selectedAccount.id, 'suspendu')}
                      className="glass" 
                      style={{ 
                        padding: '0.5rem 1rem', fontSize: '0.75rem', borderRadius: '10px',
                        backgroundColor: selectedAccount.statut === 'suspendu' ? 'rgba(255,152,0,0.1)' : 'transparent',
                        color: selectedAccount.statut === 'suspendu' ? '#ff9800' : 'inherit'
                      }}
                    >
                      <ShieldOff size={14} /> {t('suspended')}
                    </button>
                    <button 
                      disabled={updatingStatus || selectedAccount.statut === 'fermé'}
                      onClick={() => handleStatusChange(selectedAccount.id, 'fermé')}
                      className="glass" 
                      style={{ 
                        padding: '0.5rem 1rem', fontSize: '0.75rem', borderRadius: '10px',
                        backgroundColor: selectedAccount.statut === 'fermé' ? 'rgba(244,67,54,0.1)' : 'transparent',
                        color: selectedAccount.statut === 'fermé' ? '#f44336' : 'inherit'
                      }}
                    >
                      <ShieldAlert size={14} /> {t('closed')}
                    </button>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '1.2rem' }}>
                <button onClick={() => setModalType('deposit')} className="glass" title={t('deposit')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', width: '90px', height: '90px', borderRadius: '24px' }}>
                  <ArrowDownLeft color="#4caf50" size={28} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{t('deposit')}</span>
                </button>
                <button onClick={() => setModalType('withdraw')} className="glass" title={t('withdraw')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', width: '90px', height: '90px', borderRadius: '24px' }}>
                  <ArrowUpRight color="#f44336" size={28} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{t('withdraw')}</span>
                </button>
                <button onClick={() => setModalType('transfer')} className="glass" title={t('transfer')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', width: '90px', height: '90px', borderRadius: '24px' }}>
                  <Send color="var(--light-primary)" size={28} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{t('transfer')}</span>
                </button>
              </div>
            </div>

            <div className="glass" style={{ padding: '2.5rem', borderRadius: '40px', flexGrow: 1, minHeight: '400px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, opacity: 0.9 }}>{t('transactions')}</h3>
              </div>
              <TransactionList accountId={selectedAccount.id} refreshTrigger={comptes} />
            </div>
          </>
        ) : (
          <div className="glass fade-in" style={{ padding: '5rem', borderRadius: '40px', textAlign: 'center', opacity: 0.5 }}>
            <h2 style={{ fontWeight: 400 }}>Veuillez sélectionner un compte</h2>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalType && (
        <OperationModal 
          type={modalType} 
          account={selectedAccount} 
          onClose={() => setModalType(null)} 
          onSuccess={handleActionComplete}
          comptes={comptes}
        />
      )}
    </div>
  );
};

export default Dashboard;
