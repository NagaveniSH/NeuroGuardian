import React, { useState } from 'react';
import { Mail, Lock, UserCheck, Shield, ShieldCheck, ArrowRight, Brain } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { GlassInput } from '../components/GlassInput';
import { GlassButton } from '../components/GlassButton';

export const LoginScreen = () => {
  const { handleLogin, setActiveScreen } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('caregiver');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const res = await handleLogin(email, password, role);
    setLoading(false);
    if (res && res.status === 'error') {
      setErrorMessage(res.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <GlassCard style={{ width: '100%', maxWidth: '420px', padding: '32px', border: '1px solid rgba(0, 210, 255, 0.3)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(0, 210, 255, 0.15)', color: '#00D2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Brain size={32} />
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, background: 'linear-gradient(135deg, #00D2FF, #3A7BD5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            NeuroGuardian
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '4px' }}>
            Sign in to access patient healthcare portal
          </p>
        </div>

        {errorMessage && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1.5px solid #EF4444', borderRadius: '12px', padding: '12px', marginBottom: '18px', color: '#FFF', fontSize: '13px', fontWeight: 700, textAlign: 'center' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Select Role *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setRole('caregiver')}
                style={{
                  padding: '10px 6px',
                  borderRadius: '10px',
                  border: role === 'caregiver' ? '2px solid #00D2FF' : '1px solid rgba(255,255,255,0.15)',
                  background: role === 'caregiver' ? 'rgba(0, 210, 255, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  color: '#FFF',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <UserCheck size={14} /> Caregiver
              </button>

              <button
                type="button"
                onClick={() => setRole('doctor')}
                style={{
                  padding: '10px 6px',
                  borderRadius: '10px',
                  border: role === 'doctor' ? '2px solid #00D2FF' : '1px solid rgba(255,255,255,0.15)',
                  background: role === 'doctor' ? 'rgba(0, 210, 255, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  color: '#FFF',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <Shield size={14} /> Doctor
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                style={{
                  padding: '10px 6px',
                  borderRadius: '10px',
                  border: role === 'admin' ? '2px solid #00D2FF' : '1px solid rgba(255,255,255,0.15)',
                  background: role === 'admin' ? 'rgba(0, 210, 255, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  color: '#FFF',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <ShieldCheck size={14} /> Admin
              </button>
            </div>
          </div>

          <GlassInput label="Email Address *" icon={Mail} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@domain.com" required />
          
          <div>
            <GlassInput label="Password *" icon={Lock} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            <div style={{ textAlign: 'right', marginTop: '6px' }}>
              <button 
                type="button" 
                onClick={() => setActiveScreen('forgot-password')} 
                style={{ background: 'none', border: 'none', color: '#00D2FF', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <GlassButton type="submit" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? "Authenticating..." : "Sign In"} <ArrowRight size={18} />
          </GlassButton>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>Don't have an account? </span>
          <button onClick={() => setActiveScreen('signup')} style={{ background: 'none', border: 'none', color: '#00D2FF', fontWeight: 700, cursor: 'pointer' }}>
            Create Account
          </button>
        </div>

      </GlassCard>
    </div>
  );
};
