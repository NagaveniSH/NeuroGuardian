import React, { useState, useEffect } from 'react';
import { User, Calendar, Home, Phone, Stethoscope, FileText, CheckCircle2, ShieldAlert, HeartHandshake, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { GlassCard } from '../components/GlassCard';
import { GlassInput } from '../components/GlassInput';
import { GlassButton } from '../components/GlassButton';
import { ApiService } from '../services/api';

export const AddPatientScreen = () => {
  const { registerPatient, updatePatientRecord, selectedPatient, isEditingPatient, setIsEditingPatient, user, setActiveScreen } = useApp();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [secondaryEmergencyContact, setSecondaryEmergencyContact] = useState('');
  const [caregiverName, setCaregiverName] = useState(user?.displayName || user?.email || '');
  const [caregiverPhone, setCaregiverPhone] = useState(user?.phoneNumber || '');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergies, setAllergies] = useState('None reported');
  const [emergencyInstructions, setEmergencyInstructions] = useState('Keep patient calm and contact caregiver immediately.');
  const [alzheimerStage, setAlzheimerStage] = useState('Mild Cognitive Impairment (Early Stage)');
  
  const [doctorsList, setDoctorsList] = useState([]);
  const [assignedDoctorId, setAssignedDoctorId] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Fetch doctors list from DB
  useEffect(() => {
    const loadDoctors = async () => {
      const res = await ApiService.getDoctors();
      const docs = res.doctors || [];
      setDoctorsList(docs);
      if (docs.length > 0 && !assignedDoctorId) {
        setAssignedDoctorId(docs[0].uid);
      }
    };
    loadDoctors();
  }, []);

  // Pre-fill form when in Edit Mode for selectedPatient
  useEffect(() => {
    if (isEditingPatient && selectedPatient) {
      setName(selectedPatient.name || '');
      setAge(selectedPatient.age || '');
      setGender(selectedPatient.gender || 'Male');
      setAddress(selectedPatient.address || '');
      setEmergencyContact(selectedPatient.emergencyContact || '');
      setSecondaryEmergencyContact(selectedPatient.secondaryEmergencyContact || '');
      setCaregiverName(selectedPatient.caregiverName || user?.displayName || '');
      setCaregiverPhone(selectedPatient.caregiverPhone || user?.phoneNumber || '');
      setBloodGroup(selectedPatient.bloodGroup || 'O+');
      setAllergies(selectedPatient.allergies || 'None reported');
      setEmergencyInstructions(selectedPatient.emergencyInstructions || '');
      setAlzheimerStage(selectedPatient.alzheimerStage || 'Mild Cognitive Impairment (Early Stage)');
      setAssignedDoctorId(selectedPatient.assignedDoctorId || '');
      setMedicalNotes(selectedPatient.medicalNotes || '');
    } else {
      // Clear form for new patient registration
      setName('');
      setAge('');
      setGender('Male');
      setAddress('');
      setEmergencyContact('');
      setSecondaryEmergencyContact('');
      setCaregiverName(user?.displayName || user?.email || '');
      setCaregiverPhone(user?.phoneNumber || '');
      setBloodGroup('O+');
      setAllergies('None reported');
      setEmergencyInstructions('Keep patient calm and contact caregiver immediately.');
      setAlzheimerStage('Mild Cognitive Impairment (Early Stage)');
      setMedicalNotes('');
    }
  }, [isEditingPatient, selectedPatient, user]);

  // Phone Validation Regex: exactly 10 digits
  const validateTenDigits = (val) => {
    return /^\d{10}$/.test(val.trim());
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setPhoneError('');

    if (!validateTenDigits(caregiverPhone)) {
      setPhoneError('Caregiver Phone Number must contain exactly 10 digits.');
      return;
    }

    if (!validateTenDigits(emergencyContact)) {
      setPhoneError('Primary Emergency Contact Phone must contain exactly 10 digits.');
      return;
    }

    if (secondaryEmergencyContact.trim() && !validateTenDigits(secondaryEmergencyContact)) {
      setPhoneError('Secondary Emergency Contact Phone must contain exactly 10 digits.');
      return;
    }

    const selectedDoc = doctorsList.find(d => d.uid === assignedDoctorId);

    const payload = {
      name,
      age: parseInt(age),
      gender,
      address,
      emergencyContact,
      secondaryEmergencyContact: secondaryEmergencyContact.trim(),
      caregiverName,
      caregiverPhone,
      bloodGroup,
      allergies,
      emergencyInstructions,
      alzheimerStage,
      assignedDoctorId: assignedDoctorId || 'usr_doctor_default',
      assignedDoctorName: selectedDoc ? selectedDoc.displayName : (selectedPatient?.assignedDoctorName || 'Dr. Sarah Smith'),
      medicalNotes
    };

    if (isEditingPatient && selectedPatient) {
      // Perform UPDATE operation - preserves Patient ID & all linked records
      const updated = await updatePatientRecord(selectedPatient.id, payload);
      if (updated) {
        setActiveScreen('patient-profile');
      }
    } else {
      // Perform CREATE operation
      const created = await registerPatient(payload);
      if (created) {
        setActiveScreen('patient-profile');
      }
    }
  };

  const stages = [
    "Normal Cognition / No Impairment",
    "Very Mild Cognitive Decline",
    "Mild Cognitive Impairment (Early Stage)",
    "Moderate Alzheimer's (Middle Stage)",
    "Moderately Severe Alzheimer's",
    "Severe Alzheimer's (Late Stage)"
  ];

  return (
    <div style={{ minHeight: '100vh', pb: '40px' }}>
      <Navbar title={isEditingPatient ? `Edit Patient: ${selectedPatient?.name}` : "Register New Alzheimer's Patient"} />

      <div style={{ padding: '24px 20px', maxWidth: '560px', margin: '0 auto' }}>
        <GlassCard>
          {phoneError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #EF4444', borderRadius: '12px', padding: '12px', marginBottom: '16px', color: '#FFF', fontSize: '13px', fontWeight: 700, textAlign: 'center' }}>
              ⚠️ {phoneError}
            </div>
          )}

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <GlassInput label="Patient Full Name *" icon={User} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" required />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <GlassInput label="Age *" icon={Calendar} type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 72" required />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)} className="glass-input" style={{ background: '#0F172A' }}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <GlassInput label="Assigned Caregiver Name *" icon={HeartHandshake} value={caregiverName} onChange={e => setCaregiverName(e.target.value)} placeholder="Caregiver Name" required />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <GlassInput 
                  label="Caregiver Phone Number (10 Digits) *" 
                  icon={Phone} 
                  type="tel" 
                  value={caregiverPhone} 
                  onChange={e => setCaregiverPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                  placeholder="e.g. 9876543210" 
                  required 
                />
                <span style={{ fontSize: '11px', color: caregiverPhone.length === 10 ? '#10B981' : 'rgba(255,255,255,0.5)', textAlign: 'right' }}>
                  {caregiverPhone.length}/10 digits
                </span>
              </div>
            </div>

            <GlassInput label="Home Address *" icon={Home} value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter home address..." required />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <GlassInput 
                  label="Primary Emergency Contact (10 Digits) *" 
                  icon={Phone} 
                  type="tel" 
                  value={emergencyContact} 
                  onChange={e => setEmergencyContact(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                  placeholder="e.g. 9876543210" 
                  required 
                />
                <span style={{ fontSize: '11px', color: emergencyContact.length === 10 ? '#10B981' : 'rgba(255,255,255,0.5)', textAlign: 'right' }}>
                  {emergencyContact.length}/10 digits
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <GlassInput 
                  label="Secondary Emergency Contact (Optional)" 
                  icon={Phone} 
                  type="tel" 
                  value={secondaryEmergencyContact} 
                  onChange={e => setSecondaryEmergencyContact(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                  placeholder="e.g. 8765432109" 
                />
                {secondaryEmergencyContact.length > 0 && (
                  <span style={{ fontSize: '11px', color: secondaryEmergencyContact.length === 10 ? '#10B981' : 'rgba(255,255,255,0.5)', textAlign: 'right' }}>
                    {secondaryEmergencyContact.length}/10 digits
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Blood Group</label>
                <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} className="glass-input" style={{ background: '#0F172A' }}>
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <GlassInput label="Known Allergies" icon={ShieldAlert} value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="e.g. Penicillin" />
            </div>

            {/* Doctor Selection Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', color: '#00D2FF', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Stethoscope size={16} /> Assign Physician / Doctor from DB *
              </label>
              <select 
                value={assignedDoctorId} 
                onChange={e => setAssignedDoctorId(e.target.value)} 
                className="glass-input" 
                style={{ background: '#0F172A', border: '1.5px solid #00D2FF' }}
                required
              >
                {doctorsList.map(doc => (
                  <option key={doc.uid} value={doc.uid}>
                    {doc.displayName} ({doc.email})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Alzheimer's Disease Stage</label>
              <select value={alzheimerStage} onChange={e => setAlzheimerStage(e.target.value)} className="glass-input" style={{ background: '#0F172A' }}>
                {stages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <GlassInput label="Emergency Instructions for Bystanders / Scanners" icon={ShieldAlert} value={emergencyInstructions} onChange={e => setEmergencyInstructions(e.target.value)} placeholder="e.g. Keep patient calm and contact caregiver immediately." />
            <GlassInput label="Medical Notes & Care Directives" icon={FileText} value={medicalNotes} onChange={e => setMedicalNotes(e.target.value)} placeholder="Enter daily memory triggers, habits, or notes..." />

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              {isEditingPatient && (
                <GlassButton type="button" onClick={() => { setIsEditingPatient(false); setActiveScreen('patient-profile'); }} style={{ background: 'rgba(255,255,255,0.1)', flex: 1 }}>
                  Cancel
                </GlassButton>
              )}
              <GlassButton type="submit" style={{ flex: 2 }}>
                {isEditingPatient ? "Update Patient Record" : "Register Patient Record"} {isEditingPatient ? <Save size={18} /> : <CheckCircle2 size={18} />}
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};
