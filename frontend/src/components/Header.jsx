import React from 'react';
import { Sun, Moon, Globe, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Header = () => {
  const { theme, toggleTheme, lang, setLang, t, user, logout } = useApp();
  const isDark = theme === 'dark';

  return (
    <header className="glass fade-in" style={{ 
      margin: '1rem 2rem', 
      padding: '1rem 2rem', 
      borderRadius: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ 
          width: '45px', height: '45px', 
          background: 'linear-gradient(135deg, var(--light-primary), var(--light-secondary))', 
          borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: '900', fontSize: '1.5rem',
          boxShadow: '0 4px 15px rgba(0, 206, 209, 0.3)'
        }}>A</div>
        <h1 style={{ 
          fontSize: '1.6rem', fontWeight: 800, 
          background: 'linear-gradient(135deg, var(--light-primary), var(--light-accent))', 
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' 
        }}>
          {t('appName')}
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
        <button onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')} className="glass" 
          style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Globe size={18} /> {lang.toUpperCase()}
        </button>

        <button onClick={toggleTheme} className="glass" 
          style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px' }}>
          {isDark ? <Sun size={20} color="#ffcc33" /> : <Moon size={20} />}
        </button>

        {user && (
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '0.8rem',
            padding: '0.4rem 0.8rem 0.4rem 1rem',
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,206,209,0.06)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,206,209,0.15)'}`,
            borderRadius: '14px'
          }}>
            <div style={{ 
              width: '8px', height: '8px', borderRadius: '50%', 
              background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.6)' 
            }}></div>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, opacity: 0.75 }}>
              {user.email}
            </span>
            <button 
              onClick={logout}
              className="logout-btn"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            >
              <LogOut size={15} />
              {t('logout')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
