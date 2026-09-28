import React, { useState, useEffect } from 'react';
import { Pill, Clock, Plus, CheckCircle2, Calendar, FileText, Trash2, BellRing } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { GlassCard } from '../components/GlassCard';
import { GlassInput } from '../components/GlassInput';
import { GlassButton } from '../components/GlassButton';
import { StatusBadge } from '../components/StatusBadge';

export const MedicineReminderScreen = () => {
  const { medicines, addMedicine, toggleMedicine, selectedPatient, setSelectedPatient, patients } = useApp();

  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('1 Tablet');
  const [frequency, setFrequency] = useState('Once Daily');
  const [mealTiming, setMealTiming] = useState('After Food');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // Dynamic Reminder Times Array
  const [reminderTimes, setReminderTimes] = useState(['08:00 AM']);

  // Automatically update reminder time fields based on frequency selection
  useEffect(() => {
    switch (frequency) {
      case 'Once Daily':
        setReminderTimes(['08:00 AM']);
        break;
      case 'Twice Daily':
        setReminderTimes(['08:00 AM', '08:00 PM']);
        break;
      case 'Three Times Daily':
        setReminderTimes(['08:00 AM', '02:00 PM', '08:00 PM']);
        break;
      case 'Every 8 Hours':
        setReminderTimes(['06:00 AM', '02:00 PM', '10:00 PM']);
        break;
      case 'Every 6 Hours':
        setReminderTimes(['06:00 AM', '12:00 PM', '06:00 PM', '12:00 AM']);
        break;
      case 'Custom':
        if (reminderTimes.length === 0) setReminderTimes(['08:00 AM']);
        break;
      default:
        setReminderTimes(['08:00 AM']);
    }
  }, [frequency]);

  const handleTimeChange = (index, value) => {
    const updated = [...reminderTimes];
    updated[index] = value;
    setReminderTimes(updated);
  };

  const handleAddTimeField = () => {
    setReminderTimes(prev => [...prev, '12:00 PM']);
  };

  const handleRemoveTimeField = (index) => {
    if (reminderTimes.length > 1) {
      setReminderTimes(prev => prev.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!medicineName || !selectedPatient) return;

    await addMedicine({
      medicineName,
      dosage,
      frequency,
      reminderTimes,
      mealTiming,
      startDate,
      endDate,
      notes
    }, selectedPatient.id);

    setMedicineName('');
    setDosage('1 Tablet');
    setNotes('');
  };

  return (
    <div style={{ minHeight: '100vh', pb: '40px' }}>
      <Navbar title="Patient Medicine Schedule & Reminders" />

      <div style={{ padding: '24px 20px', maxWidth: '560px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Patient Selection Dropdown */}
        {patients.length > 0 && (
          <GlassCard style={{ padding: '12px 16px' }}>
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

        {/* Form: Add New Medicine Schedule */}
        <GlassCard>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Pill size={20} color="#00D2FF" /> Configure Medication Regimen
          </h3>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <GlassInput 
              label="Medicine Name *" 
              icon={Pill} 
              value={medicineName} 
              onChange={e => setMedicineName(e.target.value)} 
              placeholder="e.g. Donepezil / Memantine" 
              required 
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <GlassInput label="Dosage *" icon={FileText} value={dosage} onChange={e => setDosage(e.target.value)} placeholder="e.g. 10mg / 1 Tablet" required />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Meal Timing</label>
                <select value={mealTiming} onChange={e => setMealTiming(e.target.value)} className="glass-input" style={{ background: '#0F172A' }}>
                  <option value="After Food">After Food</option>
                  <option value="Before Food">Before Food</option>
                  <option value="With Meal">With Meal</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: '#00D2FF', fontWeight: 700 }}>Frequency Pattern *</label>
              <select value={frequency} onChange={e => setFrequency(e.target.value)} className="glass-input" style={{ background: '#0F172A', border: '1.5px solid #00D2FF' }}>
                <option value="Once Daily">Once Daily (1 Time)</option>
                <option value="Twice Daily">Twice Daily (2 Times)</option>
                <option value="Three Times Daily">Three Times Daily (3 Times)</option>
                <option value="Every 8 Hours">Every 8 Hours (3 Times)</option>
                <option value="Every 6 Hours">Every 6 Hours (4 Times)</option>
                <option value="Custom">Custom Schedule</option>
              </select>
            </div>

            {/* Dynamic Reminder Time Fields */}
            <div style={{ background: 'rgba(0, 210, 255, 0.08)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(0, 210, 255, 0.2)' }}>
              <label style={{ fontSize: '13px', color: '#00D2FF', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Clock size={16} /> Scheduled Reminder Timings ({reminderTimes.length})
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: reminderTimes.length > 2 ? '1fr 1fr' : '1fr', gap: '10px' }}>
                {reminderTimes.map((timeVal, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="text"
                      value={timeVal}
                      onChange={e => handleTimeChange(idx, e.target.value)}
                      className="glass-input"
                      style={{ background: '#0F172A', textAlign: 'center', fontWeight: 700 }}
                      placeholder="e.g. 08:00 AM"
                      required
                    />
                    {frequency === 'Custom' && reminderTimes.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTimeField(idx)}
                        style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', borderRadius: '8px', padding: '8px', color: '#EF4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {frequency === 'Custom' && (
                <button
                  type="button"
                  onClick={handleAddTimeField}
                  style={{ background: 'rgba(0, 210, 255, 0.2)', border: '1px dashed #00D2FF', borderRadius: '10px', padding: '8px', color: '#00D2FF', fontSize: '12px', fontWeight: 700, width: '100%', marginTop: '10px', cursor: 'pointer' }}
                >
                  + Add Reminder Time
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <GlassInput label="Start Date *" icon={Calendar} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
              <GlassInput label="End Date (Optional)" icon={Calendar} type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>

            <GlassInput label="Special Instructions / Notes" icon={FileText} value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Take with full glass of water..." />

            <GlassButton type="submit">
              Save Medication Schedule <Plus size={18} />
            </GlassButton>
          </form>
        </GlassCard>

        {/* Existing Scheduled Medicines for Patient */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BellRing size={20} color="#10B981" /> Active Daily Medicine Checklist ({medicines.length})
          </h3>

          {medicines.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {medicines.map(m => (
                <GlassCard key={m.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '17px', fontWeight: 800 }}>{m.medicineName}</h4>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                        Dosage: {m.dosage} • <strong style={{ color: '#F59E0B' }}>{m.mealTiming}</strong>
                      </p>
                    </div>
                    <StatusBadge label={m.frequency} color="#00D2FF" />
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '10px', marginTop: '10px' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>
                      TIMED REMINDERS & ADHERENCE:
                    </span>
                    
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {(m.reminderTimes || [m.timeOfDay || '08:00 AM']).map((tSlot, tIdx) => (
                        <button
                          key={tIdx}
                          onClick={() => toggleMedicine(m.id)}
                          style={{
                            background: m.isCompletedToday ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                            border: m.isCompletedToday ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '10px',
                            padding: '6px 12px',
                            color: m.isCompletedToday ? '#10B981' : '#FFF',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Clock size={14} /> {tSlot} {m.isCompletedToday && <CheckCircle2 size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard style={{ textAlign: 'center', padding: '30px' }}>
              <Pill size={36} color="#00D2FF" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                No active medicine schedules found for {selectedPatient?.name || 'this patient'}.
              </p>
            </GlassCard>
          )}
        </div>

      </div>
    </div>
  );
};
