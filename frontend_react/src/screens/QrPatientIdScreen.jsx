import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Brain, ShieldCheck, ExternalLink, Smartphone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { StatusBadge } from '../components/StatusBadge';

export const QrPatientIdScreen = () => {
  const { selectedPatient, setPublicEmergencyId, setActiveScreen } = useApp();

  if (!selectedPatient) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar title="Digital QR Healthcare Card" />
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>No active patient record selected.</p>
        </div>
      </div>
    );
  }

  // Resolve Active Wi-Fi Host Network IP Address dynamically
  const currentHost = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? '10.219.187.110' 
    : window.location.hostname;
    
  const currentPort = window.location.port ? `:${window.location.port}` : '';
  
  // Construct production mobile scannable URL
  const publicEmergencyUrl = `http://${currentHost}${currentPort}/?patientId=${selectedPatient.id}`;

  const handleOpenEmergencyPreview = () => {
    setPublicEmergencyId(selectedPatient.id);
    setActiveScreen('public-emergency');
  };

  const primaryPhone = selectedPatient.caregiverPhone || selectedPatient.emergencyContact || '9876543210';
  const secondaryPhone = selectedPatient.secondaryEmergencyContact || '';

  return (
    <div style={{ minHeight: '100vh', pb: '40px' }}>
      <Navbar title="Digital QR Healthcare Card" />

      <div style={{ padding: '24px 20px', maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
        <h3 style={{ fontSize: '22px', fontWeight: 800 }}>Official Alzheimer's Assistance ID</h3>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: '4px 0 20px' }}>
          Scannable by any mobile phone camera on Wi-Fi/Cellular network
        </p>

        {/* Card */}
        <GlassCard style={{ padding: '24px', border: '1.8px solid rgba(0, 210, 255, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Brain size={26} color="#00D2FF" />
              <span style={{ fontSize: '18px', fontWeight: 800, background: 'linear-gradient(135deg, #00D2FF, #3A7BD5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                NeuroGuardian
              </span>
            </div>
            <StatusBadge label="MOBILE SCANNABLE" color="#8B5CF6" />
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '20px' }} />

          {/* QR Code Container */}
          <div style={{
            background: '#FFFFFF',
            padding: '16px',
            borderRadius: '20px',
            display: 'inline-block',
            boxShadow: '0 0 25px rgba(0, 210, 255, 0.4)',
            marginBottom: '16px'
          }}>
            <QRCodeSVG value={publicEmergencyUrl} size={195} bgColor="#FFFFFF" fgColor="#0F172A" />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>{selectedPatient.name}</h2>
          <p style={{ color: '#00E5FF', fontSize: '13px', fontWeight: 700, margin: '4px 0 14px' }}>
            Patient ID: {selectedPatient.id}
          </p>

          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '12px', textAlign: 'left', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>Blood Group:</span>
              <span style={{ fontWeight: 800, color: '#EF4444' }}>{selectedPatient.bloodGroup}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>Primary Contact:</span>
              <span style={{ fontWeight: 700, color: '#00D2FF' }}>{primaryPhone}</span>
            </div>
            {secondaryPhone && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Fallback Contact:</span>
                <span style={{ fontWeight: 700, color: '#F59E0B' }}>{secondaryPhone}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>Assigned Doctor:</span>
              <span style={{ fontWeight: 700 }}>{selectedPatient.assignedDoctorName || 'Dr. Sarah Smith'}</span>
            </div>
          </div>
        </GlassCard>

        <div style={{ marginTop: '20px' }}>
          <GlassButton onClick={handleOpenEmergencyPreview}>
            Preview Emergency Landing Page <ExternalLink size={18} />
          </GlassButton>
        </div>

        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#10B981', fontSize: '12px', marginTop: '16px', fontWeight: 700 }}>
          <Smartphone size={16} />
          <span>Mobile LAN Link: {publicEmergencyUrl}</span>
        </div>

      </div>
    </div>
  );
};
