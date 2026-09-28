import React from 'react';
import { Brain, ShieldCheck, ArrowRight, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';

export const SplashScreen = () => {
  const { setActiveScreen } = useApp();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '32px 24px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: 'rgba(0, 210, 255, 0.15)',
          border: '2px solid rgba(0, 210, 255, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 0 30px rgba(0, 210, 255, 0.4)'
        }}>
          <Brain size={48} color="#00D2FF" />
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 800, background: 'linear-gradient(135deg, #00D2FF, #3A7BD5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '1px' }}>
          NeuroGuardian
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', marginTop: '8px', lineHeight: '1.5' }}>
          AI-Powered Alzheimer's Assistance & Brain Health Monitoring System
        </p>
      </div>

      <GlassCard style={{ textAlign: 'center', margin: '24px 0' }}>
        <ShieldCheck size={40} color="#00E5FF" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Empowering Alzheimer's Care</h3>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.5' }}>
          Dedicated monitoring, intelligent medication reminders, mood sentiment tracking, and one-touch caregiver emergency SOS alerts.
        </p>
      </GlassCard>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <GlassButton onClick={() => setActiveScreen('signup')}>
          Get Started <ArrowRight size={20} />
        </GlassButton>
        <button 
          onClick={() => setActiveScreen('login')}
          style={{ background: 'none', border: 'none', color: '#00D2FF', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          Already have an account? Sign In <LogIn size={16} />
        </button>
      </div>
    </div>
  );
};
