import React from 'react';
import { FileText, Pill, Smile, Brain, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';

export const ReportsScreen = () => {
  const { medicines, moodLogs, scanReports, sosLogs, selectedPatient, setSelectedPatient, patients } = useApp();

  const completedMeds = medicines.filter(m => m.isCompletedToday).length;

  return (
    <div style={{ minHeight: '100vh', pb: '40px' }}>
      <Navbar title="Comprehensive Patient Health Reports" />

      <div style={{ padding: '24px 20px', maxWidth: '560px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div>
          <h3 style={{ fontSize: '22px', fontWeight: 800 }}>
            {selectedPatient ? `${selectedPatient.name}'s Analytics` : "Patient Analytics"}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '4px' }}>
            Isolated summary of medication adherence, sentiment, CT scans, and SOS alerts.
          </p>
        </div>

        {/* Patient Selection Dropdown */}
        {patients.length > 0 && (
          <GlassCard style={{ padding: '12px' }}>
            <p style={{ fontSize: '12px', color: '#00D2FF', fontWeight: 700, marginBottom: '6px' }}>Select Target Patient:</p>
            <select 
              value={selectedPatient?.id || ''} 
              onChange={e => {
                const found = patients.find(p => p.id === e.target.value);
                if (found) setSelectedPatient(found);
              }}
              className="glass-input"
              style={{ background: '#0F172A', border: '1.5px solid #00D2FF' }}
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
              ))}
            </select>
          </GlassCard>
        )}

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <GlassCard style={{ padding: '16px' }}>
            <Pill size={24} color="#10B981" />
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#10B981', margin: '8px 0 2px' }}>{completedMeds}/{medicines.length}</h2>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Med Adherence</p>
          </GlassCard>

          <GlassCard style={{ padding: '16px' }}>
            <Smile size={24} color="#F59E0B" />
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#F59E0B', margin: '8px 0 2px' }}>{moodLogs.length}</h2>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Mood Logs</p>
          </GlassCard>

          <GlassCard style={{ padding: '16px' }}>
            <Brain size={24} color="#00D2FF" />
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#00D2FF', margin: '8px 0 2px' }}>{scanReports.length}</h2>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>CT Brain Scans</p>
          </GlassCard>

          <GlassCard style={{ padding: '16px' }}>
            <AlertTriangle size={24} color="#EF4444" />
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#EF4444', margin: '8px 0 2px' }}>{sosLogs.length}</h2>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Emergency SOS</p>
          </GlassCard>
        </div>

        {/* CT Scan Reports History */}
        {scanReports.length > 0 && (
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Brain size={18} color="#00D2FF" /> CT Scan Prediction History
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {scanReports.map(r => (
                <GlassCard key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Risk: {r.alzheimerRisk}</h4>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                      Stage: {r.stage} • Region: {r.heatmapRegion || 'Hippocampus'}
                    </p>
                  </div>
                  <StatusBadge label={r.aiConfidence || 'CONFIRMED'} color="#8B5CF6" />
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Medication Section */}
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Pill size={18} color="#10B981" /> Medication History & Compliance
          </h4>
          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {medicines.map(m => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{m.medicineName} ({m.dosage})</span>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Rule: {m.mealTiming || 'After Food'}</p>
                </div>
                <StatusBadge 
                  label={m.isCompletedToday ? "COMPLETED" : "PENDING"} 
                  color={m.isCompletedToday ? "#10B981" : "#F59E0B"} 
                />
              </div>
            ))}
          </GlassCard>
        </div>

        {/* Mood Section */}
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smile size={18} color="#F59E0B" /> Recent Sentiment Observations
          </h4>
          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {moodLogs.slice(0, 3).map(l => (
              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  "{l.inputText}"
                </span>
                <StatusBadge label={l.detectedMood} color="#8B5CF6" />
              </div>
            ))}
          </GlassCard>
        </div>

      </div>
    </div>
  );
};
