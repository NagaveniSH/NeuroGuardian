import React from 'react';
import { 
  LayoutDashboard, 
  UserPlus, 
  UserCheck, 
  Brain, 
  Smile, 
  Pill, 
  QrCode, 
  MapPin, 
  AlertTriangle, 
  FileText, 
  User, 
  Stethoscope, 
  ShieldCheck, 
  LogOut, 
  X,
  HeartHandshake
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { activeScreen, setActiveScreen, user, handleLogout, selectedPatient, openNewPatient } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['caregiver', 'doctor', 'admin'] },
    { id: 'add-patient', label: 'Register Patient', icon: UserPlus, roles: ['caregiver'], onClick: openNewPatient },
    { id: 'patient-profile', label: 'Patient Profile', icon: UserCheck, roles: ['caregiver', 'doctor'], disabled: !selectedPatient },
    { id: 'ct-scan-upload', label: 'CT Scan Analysis', icon: Brain, roles: ['caregiver', 'doctor'] },
    { id: 'mood-analysis', label: 'Mood Analysis', icon: Smile, roles: ['caregiver', 'doctor'] },
    { id: 'medicine-reminder', label: 'Medication Regimen', icon: Pill, roles: ['caregiver', 'doctor'] },
    { id: 'qr-patient-id', label: 'Emergency QR Card', icon: QrCode, roles: ['caregiver'] },
    { id: 'gps-tracking', label: 'GPS Safe Zone', icon: MapPin, roles: ['caregiver'] },
    { id: 'emergency-sos', label: 'Emergency SOS', icon: AlertTriangle, roles: ['caregiver'] },
    { id: 'reports', label: 'Health Reports', icon: FileText, roles: ['caregiver', 'doctor'] },
    { id: 'profile', label: 'My Profile', icon: User, roles: ['caregiver', 'doctor', 'admin'] },
    { id: 'doctor-dashboard', label: 'Physician Console', icon: Stethoscope, roles: ['doctor'] },
    { id: 'admin', label: 'Admin Console', icon: ShieldCheck, roles: ['admin'] },
  ];

  const userRole = user?.role || 'caregiver';

  const handleItemClick = (item) => {
    if (item.disabled) return;
    if (item.onClick) {
      item.onClick();
    } else {
      setActiveScreen(item.id);
    }
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 90,
            display: 'block'
          }}
          className="mobile-backdrop"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside 
        className={`sidebar-container ${isOpen ? 'sidebar-open' : ''}`}
        style={{
          width: '260px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px 16px',
          zIndex: 100,
          transition: 'transform 0.3s ease-in-out',
          overflowY: 'auto'
        }}
      >
        <div>
          {/* Mobile Header / Close Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', background: 'rgba(0, 210, 255, 0.2)', borderRadius: '12px', color: '#00D2FF' }}>
                <Brain size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, background: 'linear-gradient(135deg, #00D2FF, #3A7BD5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  NeuroGuardian
                </h3>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {userRole} Portal
                </span>
              </div>
            </div>

            <button 
              onClick={onClose} 
              className="mobile-close-btn"
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {navItems
              .filter(item => item.roles.includes(userRole))
              .map(item => {
                const Icon = item.icon;
                const isActive = activeScreen === item.id;
                const isDisabled = item.disabled;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    disabled={isDisabled}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: isActive ? '1.5px solid #00D2FF' : '1px solid transparent',
                      background: isActive 
                        ? 'linear-gradient(135deg, rgba(0, 210, 255, 0.25), rgba(58, 123, 213, 0.25))' 
                        : 'transparent',
                      color: isActive ? '#00D2FF' : isDisabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '14px',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? '0 0 15px rgba(0, 210, 255, 0.2)' : 'none'
                    }}
                  >
                    <Icon size={18} color={isActive ? '#00D2FF' : isDisabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)'} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </button>
                );
              })}
          </nav>
        </div>

        {/* User Card & Sign Out at Bottom */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(0, 210, 255, 0.2)', color: '#00D2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.displayName || 'User'}
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#EF4444',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              width: '100%'
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
