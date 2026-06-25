import React from 'react';
import { CreditCard, Wallet, Trash2, Power, Lock, Unlock } from 'lucide-react';
import { useApp } from '../context/AppContext';

const AccountCard = ({ compte, active, onClick, onDelete, onStatusChange }) => {
  const { t, isAdmin, isSuperAdmin } = useApp();
  
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(t('deleteConfirm'))) {
      onDelete(compte.id);
    }
  };

  // Un admin peut gérer uniquement les USER
  // Un superadmin peut gérer tout le monde
  const canManage = isAdmin && (
    !compte.userRole || compte.userRole === 'USER' || isSuperAdmin
  );
  
  return (
    <div 
      onClick={onClick}
      className={`glass fade-in ${active ? 'active' : ''}`}
      style={{ 
        padding: '1.2rem', 
        borderRadius: '24px', 
        cursor: 'pointer',
        transition: 'var(--transition)',
        border: active ? '2px solid var(--light-primary)' : '1px solid var(--light-border)',
        transform: active ? 'scale(1.02)' : 'scale(1)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        position: 'relative',
        overflow: 'hidden',
        background: active ? 'rgba(0, 206, 209, 0.05)' : 'var(--light-surface)'
      }}
    >
      <div style={{ 
        width: '52px', 
        height: '52px', 
        borderRadius: '16px',
        backgroundColor: active ? 'var(--light-primary)' : 'var(--light-accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: active ? 'white' : 'var(--light-primary)',
        transition: 'var(--transition)',
        boxShadow: active ? '0 8px 20px -5px rgba(0, 206, 209, 0.4)' : 'none'
      }}>
        {compte.typeCompte === 'epargne' ? <Wallet size={24} /> : <CreditCard size={24} />}
      </div>

      <div style={{ flexGrow: 1 }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{compte.nom} {compte.prenom}</h4>
        <p style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 500 }}>{compte.codeBanque} • {compte.typeCompte.toUpperCase()}</p>
      </div>

      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
        <p style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--light-primary)' }}>{compte.solde.toLocaleString()} <span style={{fontSize: '0.7rem'}}>FCFA</span></p>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ 
            fontSize: '0.65rem', 
            fontWeight: 700,
            padding: '0.2rem 0.6rem', 
            borderRadius: '6px', 
            textTransform: 'uppercase',
            backgroundColor: compte.statut === 'actif' ? 'rgba(76, 175, 80, 0.15)' : (compte.statut === 'suspendu' ? 'rgba(255, 152, 0, 0.15)' : 'rgba(244, 67, 54, 0.15)'),
            color: compte.statut === 'actif' ? '#2e7d32' : (compte.statut === 'suspendu' ? '#ff9800' : '#d32f2f')
          }}>
            {t(compte.statut)}
          </span>
          
          {canManage && (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {compte.statut === 'actif' ? (
                <button 
                  onClick={(e) => { e.stopPropagation(); onStatusChange(compte.id, 'suspendu'); }}
                  className="glass"
                  style={{ padding: '0.4rem', borderRadius: '8px', color: '#ff9800' }}
                  title={t('suspended')}
                >
                  <Lock size={14} />
                </button>
              ) : (
                <button 
                  onClick={(e) => { e.stopPropagation(); onStatusChange(compte.id, 'actif'); }}
                  className="glass"
                  style={{ padding: '0.4rem', borderRadius: '8px', color: '#4caf50' }}
                  title={t('active')}
                >
                  <Unlock size={14} />
                </button>
              )}

              <button 
                onClick={(e) => { e.stopPropagation(); onStatusChange(compte.id, 'fermé'); }}
                className="glass"
                style={{ padding: '0.4rem', borderRadius: '8px', color: '#9e9e9e' }}
                title={t('closed')}
              >
                <Power size={14} />
              </button>

              <button 
                onClick={handleDelete}
                className="glass"
                style={{ 
                  padding: '0.4rem', 
                  borderRadius: '8px', 
                  color: '#d32f2f',
                  border: 'none',
                  background: 'rgba(244, 67, 54, 0.05)'
                }}
                title={t('delete')}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountCard;
