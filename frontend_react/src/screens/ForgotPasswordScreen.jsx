import React, { useState } from 'react';
import { Mail, Lock, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ApiService } from '../services/api';
import { GlassCard } from '../components/GlassCard';
import { GlassInput } from '../components/GlassInput';
import { GlassButton } from '../components/GlassButton';

export const ForgotPasswordScreen = () => {
  const { setActiveScreen } = useApp();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please enter matching passwords.');
      return;
    }

    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    const res = await ApiService.forgotPassword(email, newPassword);
    setLoading(false);

    if (res.status === 'success') {
      setSuccess(res.message);
      setTimeout(() => {
        setActiveScreen('login');
      }, 2000);
    } else {
      setError(res.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <GlassCard style={{ width: '100%', maxWidth: '420px', padding: '32px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={() => setActiveScreen('login')}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', cursor: 'pointer' }}
          >
            <ArrowLeft size={18} />
          </button>
          <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Reset Password</h2>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '20px' }}>
          Enter your registered email address and new password to update your account credentials.
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1.5px solid #EF4444', borderRadius: '12px', padding: '12px', marginBottom: '16px', color: '#FFF', fontSize: '13px', fontWeight: 700, textAlign: 'center' }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1.5px solid #10B981', borderRadius: '12px', padding: '12px', marginBottom: '16px', color: '#10B981', fontSize: '13px', fontWeight: 700, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <CheckCircle2 size={18} /> {success}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <GlassInput label="Registered Email Address *" icon={Mail} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@domain.com" required />
          <GlassInput label="New Password *" icon={Lock} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" required />
          <GlassInput label="Confirm New Password *" icon={Lock} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required />

          <GlassButton type="submit" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? "Updating Password..." : "Reset Password"} <KeyRound size={18} />
          </GlassButton>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
          <button onClick={() => setActiveScreen('login')} style={{ background: 'none', border: 'none', color: '#00D2FF', fontWeight: 700, cursor: 'pointer' }}>
            Back to Sign In
          </button>
        </div>

      </GlassCard>
    </div>
  );
};
