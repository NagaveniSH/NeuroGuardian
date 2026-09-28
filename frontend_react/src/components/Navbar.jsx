import React from 'react';
import { Brain, User, ArrowLeft, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar = ({ title, showBack = true }) => {
  const { setActiveScreen, user, handleLogout } = useApp();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {showBack && (
          <button 
            onClick={() => setActiveScreen('dashboard')}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setActiveScreen('dashboard')}>
          <Brain size={26} color="#00D2FF" />
          <h2 style={{ fontSize: '20px', fontWeight: 800, background: 'linear-gradient(135deg, #00D2FF, #3A7BD5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            NeuroGuardian
          </h2>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {title && <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{title}</span>}
        
        {user ? (
          <button 
            onClick={() => setActiveScreen('profile')}
            style={{
              background: 'rgba(0, 210, 255, 0.15)',
              border: '1px solid rgba(0, 210, 255, 0.4)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00D2FF',
              cursor: 'pointer'
            }}
            title="Profile & Settings"
          >
            <User size={20} />
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveScreen('login')}
              style={{
                background: 'rgba(0, 210, 255, 0.15)',
                border: '1px solid rgba(0, 210, 255, 0.4)',
                borderRadius: '10px',
                padding: '6px 12px',
                color: '#00D2FF',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Log In
            </button>
            <button
              onClick={() => setActiveScreen('signup')}
              style={{
                background: 'linear-gradient(135deg, #00D2FF, #3A7BD5)',
                border: 'none',
                borderRadius: '10px',
                padding: '6px 12px',
                color: '#FFF',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
