import React, { useState } from 'react';
import { Mail, Lock, User, Phone, ArrowRight, UserCheck, Shield, ShieldCheck, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { GlassInput } from '../components/GlassInput';
import { GlassButton } from '../components/GlassButton';

export const SignupScreen = () => {
  const { handleSignup, setActiveScreen } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('caregiver');
  const [phoneError, setPhoneError] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setPhoneError('');
    setApiError('');

    if (phone.trim() && !/^\d{10}$/.test(phone.trim())) {
      setPhoneError('Phone number must contain exactly 10 digits.');
      return;
    }

    setLoading(true);
    const res = await handleSignup({
      name,
      email,
      password,
      role,
      phoneNumber: phone || '8095189197',
      address
    });
    setLoading(false);

    if (res && res.status === 'error') {
      setApiError(res.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <GlassCard style={{ width: '100%', maxWidth: '440px', padding: '32px', border: '1px solid rgba(0, 210, 255, 0.3)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 800, background: 'linear-gradient(135deg, #00D2FF, #3A7BD5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Create Account
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '4px' }}>
            Register to manage Alzheimer's patient records
          </p>
        </div>

        {apiError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1.5px solid #EF4444', borderRadius: '12px', padding: '12px', marginBottom: '16px', color: '#FFF', fontSize: '13px', fontWeight: 700, textAlign: 'center' }}>
            ⚠️ {apiError}
          </div>
        )}

        {phoneError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1.5px solid #EF4444', borderRadius: '12px', padding: '12px', marginBottom: '16px', color: '#FFF', fontSize: '13px', fontWeight: 700, textAlign: 'center' }}>
            ⚠️ {phoneError}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Select Role *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setRole('caregiver')}
                style={{
                  padding: '10px 4px',
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
                  padding: '10px 4px',
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
                  padding: '10px 4px',
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

          <GlassInput label="Full Name *" icon={User} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alex Johnson" required />
          <GlassInput label="Email Address *" icon={Mail} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@domain.com" required />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <GlassInput 
              label="Phone Number (10 Digits) *" 
              icon={Phone} 
              type="tel" 
              value={phone} 
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
              placeholder="e.g. 8095189197" 
              required 
            />
            <span style={{ fontSize: '11px', color: phone.length === 10 ? '#10B981' : 'rgba(255,255,255,0.5)', textAlign: 'right' }}>
              {phone.length}/10 digits
            </span>
          </div>

          <GlassInput label="Residential Address" icon={MapPin} value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. Dharwad, Karnataka" />
          <GlassInput label="Password *" icon={Lock} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />

          <GlassButton type="submit" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? "Registering Account..." : "Create Account"} <ArrowRight size={18} />
          </GlassButton>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>Already have an account? </span>
          <button onClick={() => setActiveScreen('login')} style={{ background: 'none', border: 'none', color: '#00D2FF', fontWeight: 700, cursor: 'pointer' }}>
            Sign In
          </button>
        </div>

      </GlassCard>
    </div>
  );
};
