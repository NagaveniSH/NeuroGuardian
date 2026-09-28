import React from 'react';
import { 
  UserPlus, 
  ChevronRight, 
  Brain, 
  Smile, 
  QrCode, 
  MapPin, 
  Pill, 
  AlertTriangle, 
  FileText, 
  User, 
  Stethoscope, 
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { StatusBadge } from '../components/StatusBadge';

export const DashboardScreen = () => {
  const { user, patients, selectedPatient, selectPatient, setActiveScreen, openNewPatient } = useApp();

  const userRole = user?.role || 'caregiver';

  const handlePatientClick = (patientId) => {
    selectPatient(patientId);
    setActiveScreen('patient-profile');
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '40px' }}>
      <Navbar showBack={false} title="NeuroGuardian Overview" />

      <div className="screen-container">
        
        {/* Header Greeting Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: 800 }}>
              Hello, {user?.displayName || 'Caregiver'} 👋
            </h2>
            <p style={{ fontSize: '13px', color: '#00D2FF', fontWeight: 700, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Role: {userRole}
            </p>
          </div>

          {userRole === 'caregiver' && (
            <GlassButton onClick={openNewPatient} style={{ width: 'auto', padding: '0 20px' }}>
              <UserPlus size={18} /> Add Patient
            </GlassButton>
          )}
        </div>

        {/* All Registered Patients Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={20} color="#00D2FF" /> Registered Patients ({patients.length})
            </h3>
            {userRole === 'caregiver' && patients.length > 0 && (
              <button 
                onClick={openNewPatient}
                style={{ background: 'none', border: 'none', color: '#00D2FF', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                + Register New Patient
              </button>
            )}
          </div>

          {patients.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {patients.map(p => {
                const isSelected = selectedPatient?.id === p.id;
                return (
                  <GlassCard
                    key={p.id}
                    onClick={() => handlePatientClick(p.id)}
                    style={{
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #00D2FF' : '1px solid rgba(255, 255, 255, 0.12)',
                      background: isSelected ? 'rgba(0, 210, 255, 0.12)' : 'rgba(30, 41, 59, 0.75)',
                      boxShadow: isSelected ? '0 0 20px rgba(0, 210, 255, 0.3)' : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: isSelected ? 'rgba(0, 210, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)', color: isSelected ? '#00D2FF' : '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <UserCheck size={24} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 800 }}>{p.name}</h3>
                            {isSelected && (
                              <span style={{ background: '#00D2FF', color: '#0F172A', fontSize: '10px', fontWeight: 900, padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                            Age: {p.age} yrs • Gender: {p.gender || 'Male'} • Blood Group: <strong style={{ color: '#EF4444' }}>{p.bloodGroup || 'O+'}</strong>
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={22} color="rgba(255,255,255,0.5)" />
                    </div>

                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                        Doctor: <strong style={{ color: '#00D2FF' }}>{p.assignedDoctorName || 'Dr. Sarah Smith'}</strong>
                      </span>
                      <StatusBadge label={p.alzheimerStage || 'Very Mild Cognitive Decline'} color="#8B5CF6" />
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          ) : (
            <GlassCard style={{ textAlign: 'center', padding: '32px 20px' }}>
              <UserCheck size={40} color="rgba(255,255,255,0.3)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>No Registered Patients Yet</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
                Register your first patient to view healthcare diagnostics and monitoring history.
              </p>
              {userRole === 'caregiver' && (
                <GlassButton onClick={openNewPatient} style={{ maxWidth: '240px', margin: '0 auto' }}>
                  <UserPlus size={18} /> Register First Patient
                </GlassButton>
              )}
            </GlassCard>
          )}
        </div>

        {/* Core Assistance Modules Section */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Core Assistance Modules</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            
            <GlassCard 
              onClick={() => setActiveScreen('ct-scan-upload')}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(0, 210, 255, 0.2)', color: '#00D2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Brain Scan Analysis</h4>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>CT Upload & AI Diagnosis</p>
              </div>
            </GlassCard>

            <GlassCard 
              onClick={() => setActiveScreen('mood-analysis')}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Smile size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Mood Analysis</h4>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>Sentiment & Context Advice</p>
              </div>
            </GlassCard>

            <GlassCard 
              onClick={() => setActiveScreen('medicine-reminder')}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pill size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Medication Regimen</h4>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>Multi-Time Reminders</p>
              </div>
            </GlassCard>

            {userRole === 'caregiver' && (
              <>
                <GlassCard 
                  onClick={() => setActiveScreen('qr-patient-id')}
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.2)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QrCode size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Patient QR Card</h4>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>Emergency Mobile ID</p>
                  </div>
                </GlassCard>

                <GlassCard 
                  onClick={() => setActiveScreen('gps-tracking')}
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(0, 210, 255, 0.2)', color: '#00D2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700 }}>GPS Tracking</h4>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>Safe Zone Geofence</p>
                  </div>
                </GlassCard>

                <GlassCard 
                  onClick={() => setActiveScreen('emergency-sos')}
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px', border: '1.5px solid rgba(239, 68, 68, 0.4)' }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#EF4444' }}>Emergency SOS</h4>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>Direct Caregiver Call</p>
                  </div>
                </GlassCard>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
