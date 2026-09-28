import React, { useState } from 'react';
import { User, Phone, Mail, Home, Edit3, Save, LogOut, HeartHandshake } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { GlassCard } from '../components/GlassCard';
import { GlassInput } from '../components/GlassInput';
import { GlassButton } from '../components/GlassButton';
import { StatusBadge } from '../components/StatusBadge';

export const ProfileScreen = () => {
  const { user, updateUserProfile, handleLogout } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [address, setAddress] = useState(user?.address || '');
  const [saving, setSaving] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setPhoneError('');

    if (phone && !/^\d{10}$/.test(phone.trim())) {
      setPhoneError('Phone number must contain exactly 10 digits.');
      return;
    }

    setSaving(true);
    const success = await updateUserProfile({
      email: user.email,
      displayName: name,
      phoneNumber: phone,
      address
    });
    setSaving(false);
    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', pb: '40px' }}>
      <Navbar title="Caregiver & Account Profile" />

      <div style={{ padding: '24px 20px', maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* User Card */}
        <GlassCard style={{ textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(0, 210, 255, 0.15)',
            border: '2px solid #00D2FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            color: '#00D2FF',
            boxShadow: '0 0 20px rgba(0, 210, 255, 0.4)'
          }}>
            <User size={42} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800 }}>{user?.displayName || 'Caregiver'}</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: '2px 0 10px' }}>{user?.email}</p>
          <StatusBadge label={(user?.role || 'CAREGIVER').toUpperCase()} color="#00D2FF" icon={HeartHandshake} />
        </GlassCard>

        {/* Profile Info / Form */}
        <GlassCard>
          {phoneError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #EF4444', borderRadius: '12px', padding: '12px', marginBottom: '16px', color: '#FFF', fontSize: '13px', fontWeight: 700, textAlign: 'center' }}>
              ⚠️ {phoneError}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Edit Caregiver Profile</h3>
              
              <GlassInput label="Full Name *" icon={User} value={name} onChange={e => setName(e.target.value)} required />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <GlassInput 
                  label="Phone Number (10 Digits) *" 
                  icon={Phone} 
                  type="tel" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                  required 
                />
                <span style={{ fontSize: '11px', color: phone.length === 10 ? '#10B981' : 'rgba(255,255,255,0.5)', textAlign: 'right' }}>
                  {phone.length}/10 digits
                </span>
              </div>

              <GlassInput label="Primary Address" icon={Home} value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter primary home address..." />

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <GlassButton type="button" onClick={() => setIsEditing(false)} style={{ background: 'rgba(255,255,255,0.1)', flex: 1 }}>
                  Cancel
                </GlassButton>
                <GlassButton type="submit" disabled={saving} style={{ flex: 1 }}>
                  Save Profile <Save size={18} />
                </GlassButton>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Caregiver Information</h3>
                <button 
                  onClick={() => setIsEditing(true)}
                  style={{ background: 'none', border: 'none', color: '#00D2FF', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Edit3 size={15} /> Edit
                </button>
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <User size={18} color="#00D2FF" />
                  <span>Full Name</span>
                </div>
                <span style={{ fontWeight: 700 }}>{user?.displayName}</span>
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Mail size={18} color="#00D2FF" />
                  <span>Email Address</span>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>{user?.email}</span>
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Phone size={18} color="#00D2FF" />
                  <span>Phone Number</span>
                </div>
                <span style={{ fontWeight: 700, color: '#00D2FF' }}>{user?.phoneNumber || '9876543210'}</span>
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Home size={18} color="#00D2FF" />
                  <span>Address</span>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>{user?.address || 'Springfield Health Zone'}</span>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Logout Button */}
        <GlassButton variant="danger" onClick={handleLogout}>
          Sign Out of Account <LogOut size={18} />
        </GlassButton>

      </div>
    </div>
  );
};
