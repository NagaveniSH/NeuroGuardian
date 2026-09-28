import React from 'react';
import { User, Edit3, QrCode, Brain, Home, Phone, HeartHandshake, FileText, Trash2, ShieldAlert, Stethoscope, Pill, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { StatusBadge } from '../components/StatusBadge';

export const PatientProfileScreen = () => {
  const { selectedPatient, medicines, deletePatientRecord, openEditPatient, setActiveScreen, user, successMessage, setSuccessMessage } = useApp();

  if (!selectedPatient) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar title="Patient Profile Record" />
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>No patient record selected.</p>
          <GlassButton onClick={() => setActiveScreen('dashboard')} style={{ marginTop: '16px' }}>
            Back to Dashboard
          </GlassButton>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete patient record for ${selectedPatient.name}?`)) {
      await deletePatientRecord(selectedPatient.id);
      setActiveScreen('dashboard');
    }
  };

  return (
    <div style={{ minHeight: '100vh', pb: '40px' }}>
      <Navbar title="Patient Profile Record" />

      <div style={{ padding: '24px 20px', maxWidth: '560px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Success Feedback Banner */}
        {successMessage && (
          <GlassCard style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1.5px solid #10B981', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10B981', fontWeight: 700, fontSize: '14px' }}>
              <CheckCircle2 size={20} />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', fontSize: '12px' }}>✕</button>
          </GlassCard>
        )}

        {/* Patient Header */}
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
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>{selectedPatient.name}</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: '4px 0 12px' }}>
            Patient ID: {selectedPatient.id}
          </p>
          <StatusBadge label={selectedPatient.alzheimerStage} color="#8B5CF6" icon={Brain} />
        </GlassCard>

        {/* Emergency & Caregiver Metadata */}
        <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <HeartHandshake size={18} color="#00D2FF" />
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Caregiver Name</span>
            </div>
            <span style={{ fontWeight: 700, color: '#00D2FF' }}>{selectedPatient.caregiverName}</span>
          </div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Phone size={18} color="#00D2FF" />
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Caregiver Phone</span>
            </div>
            <span style={{ fontWeight: 700, color: '#00D2FF' }}>{selectedPatient.caregiverPhone || '9876543210'}</span>
          </div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={18} color="#00D2FF" />
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Age & Gender</span>
            </div>
            <span style={{ fontWeight: 700 }}>{selectedPatient.age} yrs • {selectedPatient.gender}</span>
          </div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={18} color="#EF4444" />
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Blood Group</span>
            </div>
            <span style={{ fontWeight: 800, color: '#EF4444' }}>{selectedPatient.bloodGroup}</span>
          </div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={18} color="#F59E0B" />
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Known Allergies</span>
            </div>
            <span style={{ fontWeight: 600, color: '#F59E0B' }}>{selectedPatient.allergies}</span>
          </div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Home size={18} color="#00D2FF" />
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Home Address</span>
            </div>
            <span style={{ fontWeight: 600 }}>{selectedPatient.address}</span>
          </div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Phone size={18} color="#00D2FF" />
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Primary Emergency Phone</span>
            </div>
            <span style={{ fontWeight: 600 }}>{selectedPatient.emergencyContact}</span>
          </div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

          {selectedPatient.secondaryEmergencyContact && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Phone size={18} color="#F59E0B" />
                  <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Secondary / Fallback Phone</span>
                </div>
                <span style={{ fontWeight: 700, color: '#F59E0B' }}>{selectedPatient.secondaryEmergencyContact}</span>
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Stethoscope size={18} color="#00D2FF" />
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Assigned Doctor</span>
            </div>
            <span style={{ fontWeight: 600 }}>{selectedPatient.assignedDoctorName || selectedPatient.assignedDoctorId || "Not Assigned"}</span>
          </div>
        </GlassCard>

        {/* Display Active Medicine Schedules */}
        <GlassCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Pill size={18} color="#10B981" />
              <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Configured Medication Schedules</h4>
            </div>
            <button 
              onClick={() => setActiveScreen('medicine-reminder')}
              style={{ background: 'none', border: 'none', color: '#00D2FF', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              Manage
            </button>
          </div>

          {medicines.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {medicines.map(m => (
                <div key={m.id} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '14px' }}>{m.medicineName} ({m.dosage})</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                      {m.frequency || 'Daily'} • {m.timing} ({m.timeOfDay}) • <strong style={{ color: '#F59E0B' }}>{m.mealTiming || 'After Food'}</strong>
                    </p>
                  </div>
                  <StatusBadge label={m.isCompletedToday ? "DONE" : "ACTIVE"} color={m.isCompletedToday ? "#10B981" : "#F59E0B"} />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
              No medication schedules added yet. Click 'Manage' to add schedules.
            </p>
          )}
        </GlassCard>

        {/* Emergency & Care Directives */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ShieldAlert size={18} color="#00E5FF" />
            <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Emergency Bystander Instructions</h4>
          </div>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
            {selectedPatient.emergencyInstructions}
          </p>
        </GlassCard>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <GlassButton onClick={() => setActiveScreen('qr-patient-id')}>
            View Emergency Digital QR Card <QrCode size={18} />
          </GlassButton>

          {user?.role === 'caregiver' && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <GlassButton onClick={() => openEditPatient(selectedPatient)} style={{ flex: 1 }}>
                Edit Details <Edit3 size={18} />
              </GlassButton>
              <GlassButton variant="danger" onClick={handleDelete} style={{ flex: 1 }}>
                Delete Record <Trash2 size={18} />
              </GlassButton>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
