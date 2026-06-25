import React, { useState } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { UserPlus, Mail, Lock, Loader2, ArrowLeft, CheckCircle, User, CreditCard, Building } from 'lucide-react';

const Register = ({ onShowLogin }) => {
  const { t, theme } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [typeCompte, setTypeCompte] = useState('courant');
  const [codeBanque, setCodeBanque] = useState('UBA');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/signup`, { 
        email, 
        password, 
        nom, 
        prenom, 
        typeCompte, 
        codeBanque 
      });
      setSuccess(true);
      setTimeout(() => onShowLogin(), 2000);
    } catch (err) {
      setError(err.response?.data?.erreur || t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="auth-page"
      style={{ background: isDark ? 'linear-gradient(135deg,#0f172a,#091520,#0a1a15)' : 'linear-gradient(135deg,#f0fdf4,#e0fafb,#f0f9ff)' }}
    >
      <div className="auth-bg-blob" style={{ top: '-15%', right: '-10%', width: '45%', height: '45%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.1), transparent)', 
        filter: 'blur(100px)', position: 'absolute', animation: 'float 8s ease-in-out infinite' }}></div>
      <div className="auth-bg-blob" style={{ bottom: '-15%', left: '-10%', width: '50%', height: '50%',
        background: 'radial-gradient(circle, rgba(32,178,170,0.08), transparent)',
        filter: 'blur(100px)', position: 'absolute', animation: 'float 10s ease-in-out infinite reverse' }}></div>

      <div className="auth-card">
        <div className={`auth-card-inner ${isDark ? 'dark' : 'light'}`}
          style={{ borderColor: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.12)' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div className="auth-logo" style={{ background: 'linear-gradient(135deg,#20b2aa,#10b981)' }}>
              <UserPlus color="white" size={28} />
            </div>
            <h1 style={{
              fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em',
              color: isDark ? '#f0fafa' : '#1a2f2f', marginBottom: '0.3rem'
            }}>
              {t('signup')}
            </h1>
            <p style={{ color: '#64748b', fontWeight: 500 }}>Rejoignez AKEL Banque dès aujourd'hui</p>
          </div>

          {success ? (
            <div className="auth-success">
              <CheckCircle size={48} style={{ margin: '0 auto 1rem', display: 'block' }} />
              <p style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem' }}>{t('success')} !</p>
              <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Redirection vers la connexion...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block', fontSize: '0.75rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: isDark ? '#94a3b8' : '#64748b', marginBottom: '0.4rem'
                  }}>
                    {t('lastName')}
                  </label>
                  <div className="auth-input-wrapper" style={{ marginBottom: 0 }}>
                    <User className="auth-input-icon" size={16} />
                    <input
                      type="text" required
                      className={`auth-input ${isDark ? 'dark' : 'light'}`}
                      placeholder="Nom"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label style={{
                    display: 'block', fontSize: '0.75rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: isDark ? '#94a3b8' : '#64748b', marginBottom: '0.4rem'
                  }}>
                    {t('firstName')}
                  </label>
                  <div className="auth-input-wrapper" style={{ marginBottom: 0 }}>
                    <User className="auth-input-icon" size={16} />
                    <input
                      type="text" required
                      className={`auth-input ${isDark ? 'dark' : 'light'}`}
                      placeholder="Prénom"
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block', fontSize: '0.75rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: isDark ? '#94a3b8' : '#64748b', marginBottom: '0.4rem'
                }}>
                  {t('email')}
                </label>
                <div className="auth-input-wrapper" style={{ marginBottom: 0 }}>
                  <Mail className="auth-input-icon" size={16} />
                  <input
                    type="email" required
                    className={`auth-input ${isDark ? 'dark' : 'light'}`}
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block', fontSize: '0.75rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: isDark ? '#94a3b8' : '#64748b', marginBottom: '0.4rem'
                }}>
                  {t('password')}
                </label>
                <div className="auth-input-wrapper" style={{ marginBottom: 0 }}>
                  <Lock className="auth-input-icon" size={16} />
                  <input
                    type="password" required
                    className={`auth-input ${isDark ? 'dark' : 'light'}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{
                    display: 'block', fontSize: '0.75rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: isDark ? '#94a3b8' : '#64748b', marginBottom: '0.4rem'
                  }}>
                    {t('accountType')}
                  </label>
                  <div className="auth-input-wrapper" style={{ marginBottom: 0 }}>
                    <CreditCard className="auth-input-icon" size={16} />
                    <select
                      className={`auth-input ${isDark ? 'dark' : 'light'}`}
                      value={typeCompte}
                      onChange={(e) => setTypeCompte(e.target.value)}
                      style={{ appearance: 'none', paddingLeft: '2.5rem' }}
                    >
                      <option value="courant">{t('current')}</option>
                      <option value="epargne">{t('savings')}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{
                    display: 'block', fontSize: '0.75rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: isDark ? '#94a3b8' : '#64748b', marginBottom: '0.4rem'
                  }}>
                    {t('bankCode')}
                  </label>
                  <div className="auth-input-wrapper" style={{ marginBottom: 0 }}>
                    <Building className="auth-input-icon" size={16} />
                    <select
                      className={`auth-input ${isDark ? 'dark' : 'light'}`}
                      value={codeBanque}
                      onChange={(e) => setCodeBanque(e.target.value)}
                      style={{ appearance: 'none', paddingLeft: '2.5rem' }}
                    >
                      <option value="UBA">UBA</option>
                      <option value="ECO">ECO</option>
                      <option value="AFB">AFB</option>
                      <option value="BIC">BIC</option>
                    </select>
                  </div>
                </div>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" className="auth-submit-btn emerald" disabled={isLoading}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <><UserPlus size={18} /> {t('signup').toUpperCase()}</>}
              </button>
            </form>
          )}

          <div style={{
            marginTop: '1.5rem', paddingTop: '1.5rem',
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(16,185,129,0.1)'}`,
            textAlign: 'center'
          }}>
            <button className="auth-link-btn"
              onClick={onShowLogin}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 auto' }}>
              <ArrowLeft size={16} /> {t('hasAccount')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
