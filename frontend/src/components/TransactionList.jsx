import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowDownLeft, ArrowUpRight, Repeat, Percent } from 'lucide-react';
import { useApp } from '../context/AppContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const TransactionList = ({ accountId, refreshTrigger }) => {
  const { lang, t } = useApp();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/comptes/${accountId}/transactions`);
        setTransactions(res.data.transactions || []);
      } catch (err) {
        console.error('Transactions Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (accountId) fetchTransactions();
  }, [accountId, refreshTrigger]);

  const getIcon = (type) => {
    if (type.includes('depot')) return <ArrowDownLeft color="#4caf50" />;
    if (type.includes('retrait')) return <ArrowUpRight color="#f44336" />;
    if (type.includes('transfert')) return <Repeat color="var(--light-primary)" />;
    if (type.includes('commission')) return <Percent size={14} color="#9e9e9e" />;
    return <Repeat />;
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>{t('loading')}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {transactions.length === 0 ? (
        <div style={{ textAlign: 'center', opacity: 0.5, padding: '3rem', border: '2px dashed var(--light-border)', borderRadius: '20px' }}>
          <p>{t('noTransactions') || 'Aucune transaction trouvée.'}</p>
        </div>
      ) : (
        transactions.map((tr, idx) => (
          <div key={tr.id} className={`glass fade-in stagger-${(idx % 3) + 1}`} style={{ 
            padding: '1.2rem 1.5rem', 
            borderRadius: '24px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            border: '1px solid var(--light-border)',
            background: 'rgba(255,255,255,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '14px', 
                backgroundColor: 'var(--light-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
              }}>
                {getIcon(tr.type)}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>
                  {tr.type.toUpperCase().replace(/_/g, ' ')}
                  {tr.banqueTiers && <span style={{ fontSize: '0.75rem', opacity: 0.5, fontWeight: 500 }}> • {tr.banqueTiers}</span>}
                </p>
                <p style={{ fontSize: '0.8rem', opacity: 0.5, fontWeight: 500 }}>
                  {new Date(tr.date).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')}
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <p style={{ 
                fontWeight: 800, 
                fontSize: '1.1rem',
                color: tr.type.includes('recu') || tr.type === 'depot' || tr.type.includes('commission') ? '#2e7d32' : '#d32f2f' 
              }}>
                {tr.type.includes('recu') || tr.type === 'depot' || tr.type.includes('commission') ? '+' : '-'}
                {tr.montant.toLocaleString()} <span style={{fontSize: '0.8rem'}}>FCFA</span>
              </p>
              {tr.frais > 0 && (
                <p style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: 600 }}>
                  {t('fees')} : {tr.frais} FCFA
                </p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TransactionList;
