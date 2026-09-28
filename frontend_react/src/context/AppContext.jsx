import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiService } from '../services/api';

const AppContext = createContext();

const getInitialEmergencyId = () => {
  if (typeof window === 'undefined') return null;
  try {
    const searchParams = new URLSearchParams(window.location.search);
    let pid = searchParams.get('patientId');
    if (!pid && window.location.hash && window.location.hash.includes('patientId=')) {
      pid = window.location.hash.split('patientId=')[1]?.split('&')[0];
    }
    return pid || null;
  } catch {
    return null;
  }
};

export const AppProvider = ({ children }) => {
  const initialEmergencyId = getInitialEmergencyId();
  const [activeScreen, setActiveScreen] = useState(initialEmergencyId ? 'public-emergency' : 'splash');
  const [publicEmergencyId, setPublicEmergencyId] = useState(initialEmergencyId);

  // Edit Mode Flag & Target Patient
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Auth User Session (Persisted in localStorage)
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('neuroguardian_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Dynamic Patient Stores
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Patient-Isolated Module Stores
  const [medicines, setMedicines] = useState([]);
  const [moodLogs, setMoodLogs] = useState([]);
  const [scanReports, setScanReports] = useState([]);
  const [trackingLocation, setTrackingLocation] = useState(null);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [sosLogs, setSosLogs] = useState([]);

  // Restore Session & Fetch Patients from Database on Mount / User Change (Skip if on public emergency page)
  useEffect(() => {
    if (initialEmergencyId) return; // Do not block public QR emergency page with auth session fetches

    if (user) {
      localStorage.setItem('neuroguardian_user', JSON.stringify(user));
      fetchUserPatients(user.uid, user.role);
    } else {
      localStorage.removeItem('neuroguardian_user');
      setPatients([]);
      setSelectedPatient(null);
    }
  }, [user]);

  // Re-fetch all patient-specific modules whenever selectedPatient changes
  useEffect(() => {
    if (selectedPatient) {
      fetchMedicines(selectedPatient.id);
      fetchMoodLogs(selectedPatient.id);
      fetchScanReports(selectedPatient.id);
      fetchTracking(selectedPatient.id);
      fetchEmergencyContacts(selectedPatient.id);
    } else {
      setMedicines([]);
      setMoodLogs([]);
      setScanReports([]);
      setTrackingLocation(null);
      setEmergencyContacts([]);
    }
  }, [selectedPatient]);

  const selectPatient = (patientId) => {
    const found = patients.find(p => p.id === patientId);
    if (found) {
      setSelectedPatient(found);
    }
  };

  const fetchUserPatients = async (uid, role) => {
    const res = await ApiService.getPatients(uid, role);
    const list = res.patients || [];
    setPatients(list);
    if (list.length > 0) {
      setSelectedPatient(prev => {
        if (prev && list.some(p => p.id === prev.id)) {
          return list.find(p => p.id === prev.id);
        }
        return list[0];
      });
    } else {
      setSelectedPatient(null);
    }
  };

  const fetchMedicines = async (patientId) => {
    const res = await ApiService.getMedicines(patientId);
    setMedicines(res.medicines || []);
  };

  const fetchMoodLogs = async (patientId) => {
    const res = await ApiService.getMoodLogs(patientId);
    setMoodLogs(res.logs || []);
  };

  const fetchScanReports = async (patientId) => {
    const res = await ApiService.getScanReports(patientId);
    setScanReports(res.reports || []);
  };

  const fetchTracking = async (patientId) => {
    const res = await ApiService.getTracking(patientId);
    setTrackingLocation(res.location || null);
  };

  const fetchEmergencyContacts = async (patientId) => {
    const res = await ApiService.getEmergencyContacts(patientId);
    setEmergencyContacts(res.contacts || []);
  };

  // User Auth & Profile Updates
  const handleLogin = async (email, password, role) => {
    const res = await ApiService.login(email, password, role);
    if (res.status === 'error') {
      alert(res.message);
      return;
    }
    setUser(res.user);
    localStorage.setItem('neuroguardian_user', JSON.stringify(res.user));
    setActiveScreen(res.user.role === 'admin' ? 'admin' : 'dashboard');
  };

  const handleSignup = async (userData) => {
    const res = await ApiService.signup(userData);
    if (res.status === 'error') {
      alert(res.message);
      return;
    }
    setUser(res.user);
    localStorage.setItem('neuroguardian_user', JSON.stringify(res.user));
    setActiveScreen(res.user.role === 'admin' ? 'admin' : 'dashboard');
  };

  const updateUserProfile = async (updatedData) => {
    const res = await ApiService.updateProfile(updatedData);
    if (res.status === 'error') {
      alert(res.message);
      return false;
    }
    const updatedUser = { ...user, ...res.user };
    setUser(updatedUser);
    localStorage.setItem('neuroguardian_user', JSON.stringify(updatedUser));
    return true;
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('neuroguardian_user');
    setPatients([]);
    setSelectedPatient(null);
    setMedicines([]);
    setMoodLogs([]);
    setScanReports([]);
    setTrackingLocation(null);
    setEmergencyContacts([]);
    setSosLogs([]);
    setIsEditingPatient(false);
    setActiveScreen('login');
  };

  // Patient CRUD Handlers
  const openEditPatient = (pat) => {
    setSelectedPatient(pat || selectedPatient);
    setIsEditingPatient(true);
    setActiveScreen('add-patient');
  };

  const openNewPatient = () => {
    setIsEditingPatient(false);
    setActiveScreen('add-patient');
  };

  const registerPatient = async (patientData) => {
    if (!user) return;
    const payload = {
      ...patientData,
      caregiverId: user.uid,
      caregiverName: patientData.caregiverName || user.displayName || user.email,
      caregiverPhone: patientData.caregiverPhone || user.phoneNumber || '9876543210',
      secondaryEmergencyContact: patientData.secondaryEmergencyContact || ''
    };

    const res = await ApiService.registerPatient(payload);
    if (res.status === 'error') {
      alert(res.message);
      return null;
    }
    const newPat = res.patient;
    setPatients(prev => [...prev, newPat]);
    setSelectedPatient(newPat);
    setSuccessMessage("Patient registered successfully!");
    return newPat;
  };

  const updatePatientRecord = async (id, updatedData) => {
    const res = await ApiService.updatePatient(id, updatedData);
    if (res.status === 'error') {
      alert(res.message);
      return null;
    }
    const updatedPat = res.patient;
    setPatients(prev => prev.map(p => p.id === id ? updatedPat : p));
    if (selectedPatient?.id === id) {
      setSelectedPatient(updatedPat);
    }
    setSuccessMessage("Patient record updated successfully!");
    setIsEditingPatient(false);
    return updatedPat;
  };

  const deletePatientRecord = async (id) => {
    await ApiService.deletePatient(id);
    const filtered = patients.filter(p => p.id !== id);
    setPatients(filtered);
    if (selectedPatient?.id === id) {
      setSelectedPatient(filtered.length > 0 ? filtered[0] : null);
    }
  };

  // Medicine Operations
  const toggleMedicine = async (medId) => {
    setMedicines(prev => prev.map(m => m.id === medId ? { ...m, isCompletedToday: !m.isCompletedToday } : m));
    await ApiService.markMedicineDone(medId);
  };

  const addMedicine = async (newMed, targetPatientId) => {
    const pid = targetPatientId || selectedPatient?.id;
    if (!pid) return;
    const payload = { ...newMed, patientId: pid };
    const res = await ApiService.setMedicine(payload);
    if (selectedPatient?.id === pid) {
      setMedicines(prev => [...prev, res.medicine]);
    }
  };

  // Mood Analysis
  const analyzeMoodText = async (text, targetPatientId) => {
    const pat = patients.find(p => p.id === targetPatientId) || selectedPatient;
    if (!pat) return;
    const activeMedNames = medicines.map(m => m.medicineName);
    const res = await ApiService.analyzeMood(
      pat.id, 
      text, 
      pat.alzheimerStage, 
      activeMedNames
    );
    
    const newLog = res.log || {
      id: `mood_${Date.now()}`,
      patientId: pat.id,
      detectedMood: res.detectedMood,
      inputText: text,
      suggestion: res.suggestion,
      recommendedAction: res.recommendedAction,
      timestamp: new Date().toLocaleString()
    };
    if (selectedPatient?.id === pat.id) {
      setMoodLogs(prev => [newLog, ...prev]);
    }
    return newLog;
  };

  // CT Scan Upload
  const runScanAnalysis = async (imageData, fileName, targetPatientId) => {
    const pid = targetPatientId || selectedPatient?.id;
    if (!pid) return;
    const res = await ApiService.uploadScan(pid, imageData, fileName);
    const report = { ...res.report, timestamp: new Date().toLocaleDateString() };
    if (selectedPatient?.id === pid) {
      setScanReports(prev => [report, ...prev]);
    }
    return report;
  };

  // Emergency Contact Operations
  const saveContact = async (contactData) => {
    if (!selectedPatient) return;
    const payload = { ...contactData, patientId: selectedPatient.id };
    const res = await ApiService.saveEmergencyContact(payload);
    if (res.status === 'error') {
      alert(res.message);
      return;
    }
    setEmergencyContacts(prev => {
      const idx = prev.findIndex(c => c.id === res.contact.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = res.contact;
        return copy;
      }
      return [...prev, res.contact];
    });
  };

  const deleteContact = async (contactId) => {
    await ApiService.deleteEmergencyContact(contactId);
    setEmergencyContacts(prev => prev.filter(c => c.id !== contactId));
  };

  // SOS Alert Trigger
  const triggerSos = async () => {
    if (!selectedPatient || !user) return;
    const res = await ApiService.sendSos(selectedPatient.id, user.displayName || user.email);
    const newSos = {
      id: `sos_${Date.now()}`,
      triggeredBy: user.displayName || user.email,
      status: 'ACTIVE',
      timestamp: new Date().toLocaleTimeString()
    };
    setSosLogs(prev => [newSos, ...prev]);
    return res;
  };

  return (
    <AppContext.Provider value={{
      activeScreen,
      setActiveScreen,
      publicEmergencyId,
      setPublicEmergencyId,
      isEditingPatient,
      setIsEditingPatient,
      openEditPatient,
      openNewPatient,
      successMessage,
      setSuccessMessage,
      user,
      handleLogin,
      handleSignup,
      updateUserProfile,
      handleLogout,
      patients,
      selectedPatient,
      setSelectedPatient,
      selectPatient,
      registerPatient,
      updatePatientRecord,
      deletePatientRecord,
      medicines,
      toggleMedicine,
      addMedicine,
      moodLogs,
      analyzeMoodText,
      scanReports,
      runScanAnalysis,
      trackingLocation,
      setTrackingLocation,
      emergencyContacts,
      saveContact,
      deleteContact,
      sosLogs,
      triggerSos
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
