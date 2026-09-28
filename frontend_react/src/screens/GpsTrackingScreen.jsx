import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, ShieldCheck, RefreshCw, Navigation, AlertTriangle, Radio, Clock, Compass } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { StatusBadge } from '../components/StatusBadge';
import { ApiService } from '../services/api';

export const GpsTrackingScreen = () => {
  const { trackingLocation, setTrackingLocation, selectedPatient, setSelectedPatient, patients } = useApp();
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Fetch patient's latest GPS location from backend storage (POSTed by patient's Android phone)
  const fetchPatientLocation = useCallback(async (isAuto = false) => {
    if (!selectedPatient?.id) return;

    if (!isAuto) {
      setLoadingLoc(true);
    }

    try {
      const res = await ApiService.getTracking(selectedPatient.id);
      if (res && res.location) {
        setTrackingLocation(res.location);
        setLastSyncTime(new Date());

        const isLive = res.location.id && !res.location.id.startsWith('gps_init_');
        if (isLive) {
          setStatusMessage("📡 Live coordinates received from Patient's Phone GPS.");
        } else {
          setStatusMessage("⏳ Waiting for patient's phone GPS... (Showing registered home safe zone)");
        }
      } else {
        setStatusMessage("⏳ Waiting for patient's phone GPS...");
      }
    } catch (err) {
      setStatusMessage("⚠️ Could not reach tracking server. Retrying...");
    } finally {
      if (!isAuto) {
        setLoadingLoc(false);
      }
    }
  }, [selectedPatient?.id, setTrackingLocation]);

  // Initial load and periodic 10-second polling for live phone GPS updates
  useEffect(() => {
    fetchPatientLocation(false);

    const intervalId = setInterval(() => {
      fetchPatientLocation(true);
    }, 10000); // 10 seconds refresh interval

    return () => clearInterval(intervalId);
  }, [fetchPatientLocation]);

  const lat = trackingLocation?.latitude ?? 15.4683;
  const lng = trackingLocation?.longitude ?? 75.0039;
  const isInSafeZone = trackingLocation?.isInSafeZone !== false;
  const distanceMeters = trackingLocation?.distanceFromSafeZoneCenter ?? 0;
  const safeRadius = trackingLocation?.safeZoneRadius ?? 500;
  const isLiveGps = trackingLocation?.id && !trackingLocation.id.startsWith('gps_init_');
  const recordedTimestamp = trackingLocation?.timestamp ? new Date(trackingLocation.timestamp).toLocaleTimeString() : '--';

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '40px' }}>
      <Navbar title="GPS Safe Zone Geofence Tracking" />

      <div style={{ padding: '24px 20px', maxWidth: '580px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div>
          <h3 style={{ fontSize: '22px', fontWeight: 800 }}>Real-Time Geofence Monitoring</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '4px' }}>
            Live patient location synced from Patient Android Phone GPS.
          </p>
        </div>

        {/* Patient Selection Dropdown */}
        {patients.length > 0 && (
          <GlassCard style={{ padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <p style={{ fontSize: '12px', color: '#00D2FF', fontWeight: 700 }}>ACTIVE MONITORED PATIENT:</p>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
                ID: {selectedPatient?.id || '--'}
              </span>
            </div>
            <select 
              value={selectedPatient?.id || ''} 
              onChange={e => {
                const found = patients.find(p => p.id === e.target.value);
                if (found) setSelectedPatient(found);
              }}
              className="glass-input"
              style={{ background: '#0F172A', border: '1.5px solid #00D2FF', width: '100%', color: '#FFF' }}
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.address || 'Home Zone'}) - {p.id}</option>
              ))}
            </select>
          </GlassCard>
        )}

        {/* Safe Zone Banner */}
        <GlassCard style={{ border: `1.5px solid ${isInSafeZone ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.6)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                padding: '10px', 
                background: isInSafeZone ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
                borderRadius: '50%', 
                color: isInSafeZone ? '#10B981' : '#EF4444' 
              }}>
                {isInSafeZone ? <ShieldCheck size={24} /> : <AlertTriangle size={24} />}
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: isInSafeZone ? '#10B981' : '#EF4444' }}>
                  {isInSafeZone ? "Patient Inside Safe Zone" : "⚠️ Wandering Alert: Outside Safe Boundary!"}
                </h4>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                  Distance: <strong>{Math.round(distanceMeters)} m</strong> / Max Radius: {safeRadius} m
                </p>
              </div>
            </div>
            <StatusBadge label={isInSafeZone ? "SAFE ZONE" : "WANDERING"} color={isInSafeZone ? "#10B981" : "#EF4444"} />
          </div>
        </GlassCard>

        {/* Telemetry Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <GlassCard style={{ padding: '12px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#94A3B8', fontSize: '11px', fontWeight: 600 }}>
              <Compass size={14} color="#00D2FF" /> GPS COORDINATES
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#38BDF8', marginTop: '6px', fontFamily: 'monospace' }}>
              {typeof lat === 'number' ? lat.toFixed(4) : lat}, {typeof lng === 'number' ? lng.toFixed(4) : lng}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
              Latitude & Longitude
            </div>
          </GlassCard>

          <GlassCard style={{ padding: '12px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#94A3B8', fontSize: '11px', fontWeight: 600 }}>
              <Radio size={14} color={isLiveGps ? "#10B981" : "#F59E0B"} /> PHONE GPS SOURCE
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: isLiveGps ? "#10B981" : "#F59E0B", marginTop: '6px' }}>
              {isLiveGps ? "🟢 Live Phone GPS" : "⏳ Home Baseline"}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
              Auto-refresh: every 10s
            </div>
          </GlassCard>
        </div>

        {/* Interactive Vector Map Container */}
        <GlassCard style={{ padding: 0, overflow: 'hidden', height: '280px', position: 'relative', border: '1.5px solid rgba(0, 210, 255, 0.4)' }}>
          {/* Map Grid Vector Visual */}
          <div style={{
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {/* Grid Pattern */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(rgba(0, 210, 255, 0.15) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }} />

            {/* 500m Safe Zone Circle */}
            <div style={{
              width: '190px',
              height: '190px',
              borderRadius: '50%',
              background: isInSafeZone ? 'rgba(0, 210, 255, 0.10)' : 'rgba(239, 68, 68, 0.10)',
              border: `2px dashed ${isInSafeZone ? '#00D2FF' : '#EF4444'}`,
              boxShadow: `0 0 30px ${isInSafeZone ? 'rgba(0, 210, 255, 0.25)' : 'rgba(239, 68, 68, 0.3)'}`,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '11px', color: isInSafeZone ? '#00D2FF' : '#EF4444', fontWeight: 700, position: 'absolute', top: '10px' }}>
                {safeRadius}m Safe Radius
              </span>
            </div>

            {/* Patient Marker Pin */}
            <div style={{
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: isInSafeZone ? 'none' : 'translate(60px, -45px)',
              transition: 'transform 0.5s ease-in-out'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: isInSafeZone ? '#10B981' : '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                boxShadow: `0 0 25px ${isInSafeZone ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.9)'}`
              }}>
                <MapPin size={24} />
              </div>
              <span style={{ background: 'rgba(0,0,0,0.85)', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, marginTop: '6px', color: '#FFF' }}>
                {selectedPatient?.name || "Patient"}
              </span>
            </div>
          </div>

          {/* Coordinates Overlay */}
          <div style={{ position: 'absolute', left: '14px', bottom: '14px', background: 'rgba(0,0,0,0.85)', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, color: '#00D2FF', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Navigation size={12} />
            Lat: {typeof lat === 'number' ? lat.toFixed(4) : lat} • Lng: {typeof lng === 'number' ? lng.toFixed(4) : lng}
          </div>

          {/* Recorded Timestamp Overlay */}
          <div style={{ position: 'absolute', right: '14px', bottom: '14px', background: 'rgba(0,0,0,0.85)', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 500, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} />
            {recordedTimestamp}
          </div>
        </GlassCard>

        {statusMessage && (
          <p style={{ fontSize: '12px', color: isLiveGps ? '#10B981' : 'rgba(255,255,255,0.7)', textAlign: 'center', fontWeight: 500 }}>
            {statusMessage}
          </p>
        )}

        <GlassButton onClick={() => fetchPatientLocation(false)} disabled={loadingLoc}>
          <RefreshCw size={18} className={loadingLoc ? 'spin' : ''} /> {loadingLoc ? "Syncing from Backend..." : "Sync Patient Phone Location"}
        </GlassButton>

      </div>
    </div>
  );
};
