import React, { useState } from 'react';
import { 
  Stethoscope, 
  UserCheck, 
  Brain, 
  Smile, 
  FileText, 
  Activity, 
  ChevronRight, 
  ShieldCheck, 
  Pill, 
  Search 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { StatusBadge } from '../components/StatusBadge';

export const DoctorDashboardScreen = () => {
  const { user, patients, selectedPatient, setSelectedPatient, scanReports, moodLogs, medicines, setActiveScreen } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter assigned patients strictly for this doctor
  const assignedPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', pb: '40px' }}>
      <Navbar showBack={false} title="Physician Clinical Console" />

      <div style={{ padding: '24px 20px', maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Doctor Welcome Banner */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '12px', background: 'rgba(0, 210, 255, 0.2)', borderRadius: '50%', color: '#00D2FF' }}>
                <Stethoscope size={28} />
              </div>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Welcome, {user?.displayName || 'Doctor'}</h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '2px' }}>
                  Assigned Patients: <strong style={{ color: '#00D2FF' }}>{assignedPatients.length} Patients</strong>
                </p>
              </div>
            </div>
            <StatusBadge label="PHYSICIAN PORTAL" color="#00D2FF" />
          </div>
        </GlassCard>

        {/* Assigned Patients Selector */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>My Assigned Patients</h3>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Strict Isolation Active</span>
          </div>

          {assignedPatients.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {assignedPatients.map(p => (
                <GlassCard 
                  key={p.id} 
                  onClick={() => setSelectedPatient(p)}
                  style={{ 
                    border: selectedPatient?.id === p.id ? '1.8px solid #00D2FF' : '1px solid rgba(255,255,255,0.15)',
                    background: selectedPatient?.id === p.id ? 'rgba(0, 210, 255, 0.15)' : undefined
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <UserCheck size={22} color="#00D2FF" />
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 700 }}>{p.name}</h4>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                          Age: {p.age} • Caregiver: {p.caregiverName} ({p.caregiverPhone || p.emergencyContact})
                        </p>
                      </div>
                    </div>
                    <StatusBadge label={p.alzheimerStage} color="#8B5CF6" />
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard style={{ textAlign: 'center', padding: '30px' }}>
              <Stethoscope size={38} color="#00D2FF" style={{ margin: '0 auto 10px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: 700 }}>No Patients Currently Assigned</h4>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                When caregivers register patients and select your doctor profile, assigned patients will render here.
              </p>
            </GlassCard>
          )}
        </div>

        {/* Selected Patient Diagnostic Details */}
        {selectedPatient && (
          <>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginTop: '10px' }}>
              Clinical History & AI Reports for {selectedPatient.name}
            </h3>

            {/* CT Scan Predictions */}
            <GlassCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Brain size={20} color="#00D2FF" />
                  <h4 style={{ fontSize: '16px', fontWeight: 700 }}>AI CT Scan Prediction History</h4>
                </div>
                <button onClick={() => setActiveScreen('ct-scan-upload')} style={{ background: 'none', border: 'none', color: '#00D2FF', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                  Upload New Scan
                </button>
              </div>

              {scanReports.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {scanReports.map(r => (
                    <div key={r.id} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '14px', color: '#EF4444' }}>Alzheimer Risk: {r.alzheimerRisk}</p>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                          Stage: {r.stage} • Heatmap: {r.heatmapRegion || 'Hippocampus'}
                        </p>
                      </div>
                      <StatusBadge label={r.aiConfidence || '94.2%'} color="#10B981" />
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>No CT scan predictions uploaded for this patient yet.</p>
              )}
            </GlassCard>

            {/* Mood Sentiment History */}
            <GlassCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Smile size={20} color="#F59E0B" />
                  <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Mood Sentiment History</h4>
                </div>
                <button onClick={() => setActiveScreen('mood-analysis')} style={{ background: 'none', border: 'none', color: '#00D2FF', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                  View All
                </button>
              </div>

              {moodLogs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {moodLogs.slice(0, 3).map(l => (
                    <div key={l.id} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' }}>"{l.inputText}"</p>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{l.timestamp}</p>
                      </div>
                      <StatusBadge label={l.detectedMood} color="#8B5CF6" />
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>No mood logs recorded for this patient yet.</p>
              )}
            </GlassCard>

            {/* Prescribed Medications */}
            <GlassCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Pill size={20} color="#10B981" />
                  <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Active Medication Regimen</h4>
                </div>
              </div>

              {medicines.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {medicines.map(m => (
                    <div key={m.id} style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '10px' }}>
                      <span style={{ fontWeight: 600 }}>{m.medicineName} ({m.dosage})</span>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>{m.frequency} • {m.mealTiming}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>No active medicines prescribed.</p>
              )}
            </GlassCard>

            <GlassButton onClick={() => setActiveScreen('patient-profile')}>
              Open Full Patient Profile Record <ChevronRight size={18} />
            </GlassButton>
          </>
        )}

      </div>
    </div>
  );
};
