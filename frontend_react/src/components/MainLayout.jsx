import React, { useState } from 'react';
import { Menu, Brain, Heart, Bell } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useApp } from '../context/AppContext';

export const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, selectedPatient } = useApp();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      
      {/* Left Navigation Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Right Content Panel Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>
        
        {/* Top Header Bar with Mobile Hamburger Menu Button */}
        <header 
          style={{
            height: '60px',
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            position: 'sticky',
            top: 0,
            zIndex: 80
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hamburger-btn"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px',
                color: '#FFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Toggle Navigation Sidebar"
            >
              <Menu size={20} />
            </button>

            <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Brain size={22} color="#00D2FF" />
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>NeuroGuardian</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {selectedPatient && (
              <div style={{ background: 'rgba(0, 210, 255, 0.15)', border: '1px solid rgba(0, 210, 255, 0.3)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', color: '#00D2FF', fontWeight: 700 }}>
                Active Patient: {selectedPatient.name}
              </div>
            )}
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
              {user?.displayName || 'User'}
            </div>
          </div>
        </header>

        {/* Dynamic Right Content Display Panel */}
        <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>

    </div>
  );
};
