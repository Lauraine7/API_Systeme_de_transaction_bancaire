import React, { useState } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { LogIn, Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';

const Login = ({ onShowRegister }) => {
  const { t, login, theme } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/login`, { email, password });
      login(response.data.user, response.data.token);
    } catch (err) {
      setError(err.response?.data?.erreur || t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`auth-page ${isDark ? 'auth-bg-dark' : 'auth-bg-light'}`}
      style={{ background: isDark ? 'linear-gradient(135deg,#0f172a,#0c1a2e,#091520)' : 'linear-gradient(135deg,#f0f9ff,#e0fafb,#f0fdf4)' }}
    >
      <div className="auth-bg-blob auth-blob-1"></div>
      <div className="auth-bg-blob auth-blob-2"></div>
      <div className="auth-bg-blob auth-blob-3"></div>

      <div className="auth-card">
        <div className={`auth-card-inner ${isDark ? 'dark' : 'light'}`}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div className="auth-logo">
              <LogIn color="white" size={28} />
              <div style={{
                position: 'absolute', bottom: '-6px', right: '-6px',
                background: 'white', borderRadius: '50%', padding: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <ShieldCheck color="#00ced1" size={14} />
              </div>
            </div>
            <h1 style={{
              fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em',
              color: isDark ? '#f0fafa' : '#1a2f2f', marginBottom: '0.3rem'
            }}>
              {t('appName')}
            </h1>
            <p style={{ color: '#64748b', fontWeight: 500 }}>{t('welcomeBack')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{
                display: 'block', fontSize: '0.8rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                color: isDark ? '#94a3b8' : '#64748b', marginBottom: '0.5rem'
              }}>
                {t('email')}
              </label>
              <div className="auth-input-wrapper" style={{ marginBottom: 0 }}>
                <Mail className="auth-input-icon" size={18} />
                <input
                  type="email" required
                  className={`auth-input ${isDark ? 'dark' : 'light'}`}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
              <label style={{
                display: 'block', fontSize: '0.8rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                color: isDark ? '#94a3b8' : '#64748b', marginBottom: '0.5rem'
              }}>
                {t('password')}
              </label>
              <div className="auth-input-wrapper" style={{ marginBottom: 0 }}>
                <Lock className="auth-input-icon" size={18} />
                <input
                  type="password" required
                  className={`auth-input ${isDark ? 'dark' : 'light'}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-submit-btn" disabled={isLoading}
              style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <><LogIn size={18} /> {t('login').toUpperCase()}</>}
            </button>
          </form>

          <div style={{
            marginTop: '1.5rem', paddingTop: '1.5rem',
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,206,209,0.12)'}`,
            textAlign: 'center'
          }}>
            <span style={{ color: '#94a3b8', fontWeight: 500 }}>{t('noAccount')} </span>
            <button className="auth-link-btn" onClick={onShowRegister}>
              {t('signup')} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
