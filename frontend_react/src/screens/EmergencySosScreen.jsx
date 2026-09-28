import React, { useState } from 'react';
import { AlertTriangle, Phone, Plus, Trash2, Edit2, ShieldAlert, CheckCircle2, UserCheck, PhoneCall, PhoneForwarded } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { GlassCard } from '../components/GlassCard';
import { GlassInput } from '../components/GlassInput';
import { GlassButton } from '../components/GlassButton';
import { StatusBadge } from '../components/StatusBadge';

export const EmergencySosScreen = () => {
  const { selectedPatient, emergencyContacts, saveContact, deleteContact, triggerSos } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('Family Contact');
  const [editingId, setEditingId] = useState(null);
  const [phoneError, setPhoneError] = useState('');

  const caregiverPhone = selectedPatient?.caregiverPhone || selectedPatient?.emergencyContact || '8095189197';
  const secondaryPhone = selectedPatient?.secondaryEmergencyContact || '';

  // Direct Phone Call Trigger to Primary Caregiver
  const handleDirectCallCaregiver = () => {
    const cleanPhone = caregiverPhone.replace(/[^\d+]/g, '');
    triggerSos(); // Log SOS event in background
    window.location.href = `tel:${cleanPhone}`;
  };

  // Direct Phone Call Trigger to Secondary / Fallback Contact
  const handleDirectCallSecondary = () => {
    if (!secondaryPhone) return;
    const cleanPhone = secondaryPhone.replace(/[^\d+]/g, '');
    triggerSos(); // Log SOS event in background
    window.location.href = `tel:${cleanPhone}`;
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    setPhoneError('');

    if (!/^\d{10}$/.test(phone.trim())) {
      setPhoneError('Phone number must contain exactly 10 digits.');
      return;
    }

    await saveContact({
      id: editingId,
      name,
      phone,
      relationship
    });

    setName('');
    setPhone('');
    setRelationship('Family Contact');
    setEditingId(null);
  };

  const handleEditClick = (c) => {
    setEditingId(c.id);
    setName(c.name);
    setPhone(c.phone);
    setRelationship(c.relationship || 'Family Contact');
    setPhoneError('');
  };

  return (
    <div style={{ minHeight: '100vh', pb: '40px' }}>
      <Navbar title="Emergency Direct Call & Caregiver SOS" />

      <div style={{ padding: '24px 20px', maxWidth: '560px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Giant Emergency SOS Trigger Button (Direct Phone Call to Caregiver) */}
        <GlassCard style={{ textAlign: 'center', padding: '30px 20px', border: '2px solid rgba(239, 68, 68, 0.6)' }}>
          <p style={{ color: '#EF4444', fontWeight: 800, fontSize: '13px', letterSpacing: '1px', marginBottom: '8px' }}>
            IMMEDIATE EMERGENCY PHONE CALL
          </p>
          
          <button
            onClick={handleDirectCallCaregiver}
            style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #EF4444, #991B1B)',
              border: '4px solid #FF8888',
              boxShadow: '0 0 35px rgba(239, 68, 68, 0.7)',
              color: '#FFF',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
          >
            <PhoneCall size={52} />
            <span style={{ fontSize: '17px', fontWeight: 900, marginTop: '4px' }}>CALL SOS</span>
          </button>

          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', maxWidth: '380px', margin: '0 auto', fontWeight: 600 }}>
            Pressing CALL SOS directly dials primary caregiver: <strong style={{ color: '#00D2FF' }}>{selectedPatient?.caregiverName || 'Alex'} ({caregiverPhone})</strong>
          </p>

          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={handleDirectCallCaregiver}
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                color: '#FFF',
                fontWeight: 800,
                fontSize: '15px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <PhoneCall size={18} /> Call Primary Caregiver ({caregiverPhone})
            </button>

            {secondaryPhone && (
              <button
                onClick={handleDirectCallSecondary}
                style={{
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  color: '#FFF',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
                }}
              >
                <PhoneForwarded size={18} /> Call Fallback Contact ({secondaryPhone})
              </button>
            )}
          </div>
        </GlassCard>

        {/* Emergency Contacts List */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Phone size={20} color="#00D2FF" /> Additional Emergency Contacts ({emergencyContacts.length})
          </h3>

          {emergencyContacts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {emergencyContacts.map(c => (
                <GlassCard key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700 }}>{c.name}</h4>
                    <p style={{ fontSize: '12px', color: '#00D2FF', marginTop: '2px', fontWeight: 600 }}>{c.phone}</p>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{c.relationship}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <a href={`tel:${c.phone.replace(/[^\d+]/g, '')}`} style={{ textDecoration: 'none' }}>
                      <button style={{ background: '#10B981', border: 'none', borderRadius: '8px', padding: '8px 12px', color: '#FFF', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <PhoneCall size={14} /> Call
                      </button>
                    </a>
                    <button onClick={() => handleEditClick(c)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '8px', color: '#00D2FF', cursor: 'pointer' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => deleteContact(c.id)} style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', borderRadius: '8px', padding: '8px', color: '#EF4444', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>No additional emergency contacts added yet.</p>
            </GlassCard>
          )}
        </div>

        {/* Add / Edit Emergency Contact Form */}
        <GlassCard>
          <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
            {editingId ? "Edit Emergency Contact" : "Add Emergency Contact"}
          </h4>

          {phoneError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #EF4444', borderRadius: '12px', padding: '10px', marginBottom: '14px', color: '#FFF', fontSize: '12px', fontWeight: 700, textAlign: 'center' }}>
              ⚠️ {phoneError}
            </div>
          )}

          <form onSubmit={handleSaveContact} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <GlassInput label="Contact Full Name *" icon={UserCheck} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mary Jane" required />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <GlassInput 
                label="Phone Number (10 Digits) *" 
                icon={Phone} 
                type="tel" 
                value={phone} 
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                placeholder="e.g. 9876543210" 
                required 
              />
              <span style={{ fontSize: '11px', color: phone.length === 10 ? '#10B981' : 'rgba(255,255,255,0.5)', textAlign: 'right' }}>
                {phone.length}/10 digits
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Relationship</label>
              <select value={relationship} onChange={e => setRelationship(e.target.value)} className="glass-input" style={{ background: '#0F172A' }}>
                <option value="Family Contact">Family Contact</option>
                <option value="Spouse">Spouse</option>
                <option value="Son / Daughter">Son / Daughter</option>
                <option value="Neighbor">Neighbor</option>
                <option value="Physician">Physician</option>
              </select>
            </div>

            <GlassButton type="submit">
              {editingId ? "Update Contact" : "Save Emergency Contact"} <Plus size={18} />
            </GlassButton>
          </form>
        </GlassCard>

      </div>
    </div>
  );
};
