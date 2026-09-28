import React, { useState, useEffect } from 'react';
import { ShieldAlert, PhoneCall, MapPin, AlertTriangle, Heart, User, Stethoscope, ExternalLink, PhoneForwarded, Loader2 } from 'lucide-react';
import { ApiService } from '../services/api';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { StatusBadge } from '../components/StatusBadge';

export const PublicEmergencyPage = ({ patientId }) => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [currentCoords, setCurrentCoords] = useState({ lat: 15.4683, lng: 75.0039 });

  // 1. Fetch Live Patient Emergency Data from Database using scanned patientId
  useEffect(() => {
    let isMounted = true;

    const fetchEmergency = async () => {
      let targetPid = patientId;
      if (!targetPid && typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        targetPid = urlParams.get('patientId');
        if (!targetPid && window.location.hash && window.location.hash.includes('patientId=')) {
          targetPid = window.location.hash.split('patientId=')[1]?.split('&')[0];
        }
      }

      if (!targetPid) {
        if (isMounted) {
          setErrorMsg('No Patient ID specified in QR scan.');
          setLoading(false);
        }
        return;
      }

      try {
        const res = await ApiService.getPublicEmergency(targetPid);
        if (isMounted) {
          if (res && res.status === 'success' && res.emergencyInfo) {
            setInfo(res.emergencyInfo);
            if (res.emergencyInfo.latitude && res.emergencyInfo.longitude) {
              setCurrentCoords({
                lat: res.emergencyInfo.latitude,
                lng: res.emergencyInfo.longitude
              });
            }
          } else {
            setErrorMsg(res?.message || 'Patient record not found.');
          }
        }
      } catch (e) {
        if (isMounted) setErrorMsg('Failed to connect to emergency server.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEmergency();

    return () => {
      isMounted = false;
    };
  }, [patientId]);

  // 2. Geolocation Acquisition (Runs in background, completely non-blocking)
  useEffect(() => {
    if (typeof navigator !== 'undefined' && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {},
        { timeout: 3000, maximumAge: 60000, enableHighAccuracy: false }
      );
    }
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <GlassCard style={{ textAlign: 'center', padding: '40px 24px', maxWidth: '400px', width: '100%' }}>
          <Loader2 size={40} color="#00D2FF" className="animate-spin" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Retrieving Patient Record...</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '8px' }}>
            Loading live emergency contact details from secure database.
          </p>
        </GlassCard>
      </div>
    );
  }

  if (errorMsg || !info) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <GlassCard style={{ textAlign: 'center', padding: '36px 24px', maxWidth: '420px', width: '100%', border: '1.5px solid #EF4444' }}>
          <AlertTriangle size={44} color="#EF4444" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#EF4444' }}>Emergency Record Not Found</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginTop: '8px' }}>
            {errorMsg || 'Unable to retrieve emergency record for this QR code.'}
          </p>
        </GlassCard>
      </div>
    );
  }

  const primaryNumber = info.caregiverPhone || info.emergencyContact || '';
  const secondaryNumber = info.secondaryEmergencyContact || '';

  // Direct Phone Call Trigger to Primary Emergency Contact
  const handleDirectCallPrimary = () => {
    if (!primaryNumber) return;
    const cleanPhone = primaryNumber.replace(/[^\d+]/g, '');
    window.location.href = `tel:${cleanPhone}`;
  };

  // Direct Phone Call Trigger to Fallback Secondary Emergency Contact
  const handleDirectCallSecondary = () => {
    if (!secondaryNumber) return;
    const cleanPhone = secondaryNumber.replace(/[^\d+]/g, '');
    window.location.href = `tel:${cleanPhone}`;
  };

  const googleMapsUrl = `https://www.google.com/maps?q=${currentCoords.lat},${currentCoords.lng}`;
  const patientName = info.name || 'Patient';
  const bloodGroup = info.bloodGroup || 'A+';
  const allergies = info.allergies || 'None reported';
  const medicationsList = info.medications && info.medications.length > 0 ? info.medications : ['None listed'];
  const instructions = info.emergencyInstructions || 'Keep patient calm and contact caregiver immediately.';
  const doctorName = info.assignedDoctorName || 'Dr. Sarah Smith (Neurologist)';
  const caregiverName = info.caregiverName || 'Primary Caregiver';

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: '500px', margin: '0 auto' }}>
      
      {/* Header SOS Banner */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.2)',
          border: '2px solid #EF4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          color: '#EF4444',
          boxShadow: '0 0 25px rgba(239, 68, 68, 0.5)'
        }}>
          <ShieldAlert size={40} />
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#FF5252' }}>EMERGENCY ASSISTANCE</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginTop: '4px' }}>
          Official Mobile Medical ID Card
        </p>
      </div>

      {/* Patient Emergency Details Card */}
      <GlassCard style={{ border: '1.8px solid rgba(239, 68, 68, 0.6)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0, 210, 255, 0.2)', color: '#00D2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: 800 }}>{patientName}</h3>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Patient ID: {info.id || patientId}</p>
            </div>
          </div>
          <StatusBadge label={`BLOOD: ${bloodGroup}`} color="#EF4444" />
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '14px' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
          {/* Primary Contact Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0, 210, 255, 0.12)', border: '1px solid #00D2FF', padding: '12px', borderRadius: '10px', alignItems: 'center' }}>
            <div>
              <span style={{ color: 'rgba(255,255,255,0.7)', display: 'block', fontSize: '11px' }}>PRIMARY CAREGIVER CONTACT</span>
              <span style={{ fontWeight: 800, color: '#00D2FF', fontSize: '15px' }}>{caregiverName} ({primaryNumber})</span>
            </div>
            <button 
              onClick={handleDirectCallPrimary}
              style={{ background: '#10B981', border: 'none', borderRadius: '8px', padding: '8px 12px', color: '#FFF', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <PhoneCall size={14} /> Call
            </button>
          </div>

          {/* Secondary / Fallback Contact Row (when configured) */}
          {secondaryNumber && (
            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid #F59E0B', padding: '12px', borderRadius: '10px', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#F59E0B', display: 'block', fontSize: '11px', fontWeight: 700 }}>SECONDARY / FALLBACK CONTACT</span>
                <span style={{ fontWeight: 800, color: '#FFF', fontSize: '15px' }}>{secondaryNumber}</span>
              </div>
              <button 
                onClick={handleDirectCallSecondary}
                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', border: 'none', borderRadius: '8px', padding: '8px 12px', color: '#FFF', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <PhoneForwarded size={14} /> Call Fallback
              </button>
            </div>
          )}

          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <span style={{ color: '#F59E0B', fontWeight: 700 }}>Known Allergies:</span> {allergies}
          </div>

          <div>
            <span style={{ color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '4px' }}>Active Prescribed Medications:</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {medicationsList.map((m, idx) => (
                <span key={idx} style={{ background: 'rgba(0, 210, 255, 0.15)', border: '1px solid rgba(0, 210, 255, 0.3)', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', color: '#00D2FF', fontWeight: 600 }}>
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.06)', padding: '12px', borderRadius: '12px' }}>
            <span style={{ color: '#00E5FF', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Bystander Emergency Instructions:</span>
            <p style={{ lineHeight: '1.4', color: 'rgba(255,255,255,0.9)' }}>{instructions}</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Assigned Physician:</span>
            <span style={{ fontWeight: 700, color: '#00D2FF', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Stethoscope size={14} /> {doctorName}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Primary Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <button 
          onClick={handleDirectCallPrimary}
          style={{
            background: 'linear-gradient(135deg, #10B981, #059669)',
            border: 'none',
            borderRadius: '14px',
            padding: '14px',
            color: '#FFF',
            fontWeight: 800,
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
          }}
        >
          <PhoneCall size={20} /> Call Primary
        </button>

        <button 
          onClick={handleDirectCallPrimary}
          style={{
            background: 'linear-gradient(135deg, #EF4444, #991B1B)',
            border: 'none',
            borderRadius: '14px',
            padding: '14px',
            color: '#FFF',
            fontWeight: 800,
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
          }}
        >
          <AlertTriangle size={20} /> Trigger SOS Call
        </button>
      </div>

      {/* Secondary Fallback Call Button (if configured) */}
      {secondaryNumber && (
        <div style={{ marginBottom: '12px' }}>
          <button 
            onClick={handleDirectCallSecondary}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              border: 'none',
              borderRadius: '14px',
              padding: '14px',
              color: '#FFF',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
            }}
          >
            <PhoneForwarded size={18} /> Call Fallback Contact ({secondaryNumber})
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <button 
          onClick={handleDirectCallPrimary}
          style={{
            background: 'linear-gradient(135deg, #00D2FF, #3A7BD5)',
            border: 'none',
            borderRadius: '14px',
            padding: '14px',
            color: '#FFF',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <PhoneCall size={18} /> Call Location
        </button>

        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <GlassButton style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', width: '100%' }}>
            Open in Maps <ExternalLink size={16} />
          </GlassButton>
        </a>
      </div>

      <GlassButton onClick={() => setShowMap(!showMap)} style={{ background: 'rgba(255,255,255,0.15)', marginBottom: '20px' }}>
        <MapPin size={18} /> {showMap ? "Hide Interactive Safe Zone Map" : "View Safe Zone Map"}
      </GlassButton>

      {showMap && (
        <GlassCard style={{ marginBottom: '20px', padding: '16px', textAlign: 'center' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px', color: '#00D2FF' }}>
            Safe Zone Area ({currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)})
          </h4>
          <div style={{ height: '180px', background: '#0F172A', borderRadius: '14px', border: '1px solid #00D2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '2px dashed #00D2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={24} color="#10B981" />
            </div>
          </div>
        </GlassCard>
      )}

      <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
        <Heart size={14} color="#FF5252" />
        <span>NeuroGuardian Direct Caregiver Emergency System</span>
      </div>

    </div>
  );
};
