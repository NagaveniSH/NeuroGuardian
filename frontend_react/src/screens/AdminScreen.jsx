import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Stethoscope, UserCheck, Activity, Search, Database } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { ApiService } from '../services/api';

export const AdminScreen = () => {
  const { user } = useApp();
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('caregivers');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      const res = await ApiService.getAdminStats();
      if (res.status === 'success') {
        setStats(res.stats);
      }
    };
    loadStats();
  }, []);

  const caregivers = (stats?.caregivers || []).filter(c => 
    c.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const doctors = (stats?.doctors || []).filter(d => 
    d.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const patients = (stats?.patients || []).filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', pb: '40px' }}>
      <Navbar showBack={false} title="System Administrator Console" />

      <div style={{ padding: '24px 20px', maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Admin Header Banner */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '12px', background: 'rgba(0, 210, 255, 0.2)', borderRadius: '50%', color: '#00D2FF' }}>
                <ShieldCheck size={28} />
              </div>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Admin Console</h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '2px' }}>
                  MongoDB Real-time Healthcare Database View
                </p>
              </div>
            </div>
            <StatusBadge label="MONGODB SYNC" color="#10B981" icon={Database} />
          </div>
        </GlassCard>

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <GlassCard style={{ padding: '14px', textAlign: 'center' }}>
            <UserCheck size={22} color="#00D2FF" style={{ margin: '0 auto 4px' }} />
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#00D2FF' }}>{stats?.totalCaregivers || 1}</h2>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Caregivers</p>
          </GlassCard>

          <GlassCard style={{ padding: '14px', textAlign: 'center' }}>
            <Stethoscope size={22} color="#8B5CF6" style={{ margin: '0 auto 4px' }} />
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#8B5CF6' }}>{stats?.totalDoctors || 1}</h2>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Physicians</p>
          </GlassCard>

          <GlassCard style={{ padding: '14px', textAlign: 'center' }}>
            <Users size={22} color="#10B981" style={{ margin: '0 auto 4px' }} />
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#10B981' }}>{stats?.totalPatients || 1}</h2>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Registered Patients</p>
          </GlassCard>
        </div>

        {/* Search Bar */}
        <GlassCard style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={18} color="rgba(255,255,255,0.5)" />
          <input 
            type="text" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            placeholder="Search database by name, email, or patient ID..." 
            style={{ background: 'none', border: 'none', color: '#FFF', fontSize: '14px', outline: 'none', width: '100%' }}
          />
        </GlassCard>

        {/* Tab Navigation */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {['caregivers', 'doctors', 'patients'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px',
                borderRadius: '10px',
                border: activeTab === tab ? '1.8px solid #00D2FF' : '1px solid rgba(255,255,255,0.15)',
                background: activeTab === tab ? 'rgba(0, 210, 255, 0.2)' : 'rgba(255,255,255,0.05)',
                color: '#FFF',
                fontWeight: 700,
                fontSize: '13px',
                textTransform: 'capitalize',
                cursor: 'pointer'
              }}
            >
              {tab} ({tab === 'caregivers' ? caregivers.length : tab === 'doctors' ? doctors.length : patients.length})
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        {activeTab === 'caregivers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {caregivers.map((c, idx) => (
              <GlassCard key={c.uid || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700 }}>{c.displayName}</h4>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>Email: {c.email}</p>
                  <p style={{ fontSize: '12px', color: '#00D2FF', marginTop: '2px' }}>Phone: {c.phoneNumber || '8095189197'}</p>
                </div>
                <StatusBadge label="CAREGIVER" color="#00D2FF" />
              </GlassCard>
            ))}
          </div>
        )}

        {activeTab === 'doctors' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {doctors.map((d, idx) => (
              <GlassCard key={d.uid || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700 }}>{d.displayName}</h4>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>Email: {d.email}</p>
                  <p style={{ fontSize: '12px', color: '#8B5CF6', marginTop: '2px' }}>Phone: {d.phoneNumber || '8095189197'}</p>
                </div>
                <StatusBadge label="PHYSICIAN" color="#8B5CF6" />
              </GlassCard>
            ))}
          </div>
        )}

        {activeTab === 'patients' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {patients.map((p, idx) => (
              <GlassCard key={p.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700 }}>{p.name} (Age: {p.age})</h4>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                    Caregiver: {p.caregiverName} ({p.caregiverPhone || p.emergencyContact})
                  </p>
                  <p style={{ fontSize: '12px', color: '#00D2FF', marginTop: '2px' }}>Doctor: {p.assignedDoctorName}</p>
                </div>
                <StatusBadge label={p.alzheimerStage} color="#10B981" />
              </GlassCard>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
