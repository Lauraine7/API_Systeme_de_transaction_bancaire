import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const OperationModal = ({ type, account, onClose, onSuccess, comptes }) => {
  const { t } = useApp();
  const [montant, setMontant] = useState('');
  const [destId, setDestId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // For account creation
  const [formData, setFormData] = useState({ nom: '', prenom: '', email: '', typeCompte: 'courant', codeBanque: 'UBA' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (type === 'deposit') {
        await axios.post(`${API_URL}/comptes/${account.id}/depot`, { montant: parseFloat(montant) });
      } else if (type === 'withdraw') {
        await axios.post(`${API_URL}/comptes/${account.id}/retrait`, { montant: parseFloat(montant) });
      } else if (type === 'transfer') {
        await axios.post(`${API_URL}/transfert`, { expediteurId: account.id, destinataireId: parseInt(destId), montant: parseFloat(montant) });
      } else if (type === 'create') {
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
        await axios.post(`${API_URL}/admin/comptes`, formData, config);
      } else if (type === 'createAdmin') {
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
        await axios.post(`${API_URL}/admin/signup`, formData, config);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div className="glass fade-in" style={{ 
        width: '400px', 
        padding: '2rem', 
        borderRadius: '30px',
        position: 'relative'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', padding: '0.4rem', borderRadius: '50%' }} className="glass">
          <X size={20} />
        </button>

        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>{t(type)}</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {type === 'create' || type === 'createAdmin' ? (
            <>
              <input type="text" placeholder={t('lastName')} required className="glass" style={{ padding: '0.8rem', borderRadius: '12px' }} value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
              <input type="text" placeholder={t('firstName')} required className="glass" style={{ padding: '0.8rem', borderRadius: '12px' }} value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} />
              <input type="email" placeholder={t('email')} required className="glass" style={{ padding: '0.8rem', borderRadius: '12px' }} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              
              {type === 'createAdmin' && (
                <input type="password" placeholder={t('password')} required className="glass" style={{ padding: '0.8rem', borderRadius: '12px' }} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              )}

              {type === 'create' && (
                <>
                  <select className="glass" style={{ padding: '0.8rem', borderRadius: '12px' }} value={formData.typeCompte} onChange={e => setFormData({...formData, typeCompte: e.target.value})}>
                    <option value="courant">{t('current')}</option>
                    <option value="epargne">{t('savings')}</option>
                  </select>
                  <select className="glass" style={{ padding: '0.8rem', borderRadius: '12px' }} value={formData.codeBanque} onChange={e => setFormData({...formData, codeBanque: e.target.value})}>
                    <option value="UBA">UBA</option>
                    <option value="ECO">ECOBANK</option>
                    <option value="AFB">AFRILAND</option>
                    <option value="BIC">BICEC</option>
                  </select>
                </>
              )}
            </>
          ) : (
            <>
              {type === 'transfer' && (
                <select 
                  required 
                  className="glass" 
                  style={{ padding: '0.8rem', borderRadius: '12px' }} 
                  value={destId} 
                  onChange={e => setDestId(e.target.value)}
                >
                  <option value="">{t('to')}...</option>
                  {comptes.filter(c => c.id !== account.id && c.id !== 0).map(c => (
                    <option key={c.id} value={c.id}>{c.nom} {c.prenom} ({c.codeBanque})</option>
                  ))}
                </select>
              )}
              <div style={{ position: 'relative' }}>
                <input 
                  type="number" 
                  placeholder={t('amount')} 
                  required 
                  className="glass" 
                  style={{ padding: '0.8rem', borderRadius: '12px', width: '100%' }} 
                  value={montant}
                  onChange={e => setMontant(e.target.value)}
                />
                <span style={{ position: 'absolute', right: '1rem', top: '0.8rem', opacity: 0.5 }}>FCFA</span>
              </div>
            </>
          )}

          {error && <p style={{ color: '#f44336', fontSize: '0.8rem', textAlign: 'center' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} style={{ flexGrow: 1 }} className="glass">{t('cancel')}</button>
            <button type="submit" disabled={loading} style={{ flexGrow: 2 }} className="btn-primary">
              {loading ? t('loading') : t('confirm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OperationModal;
