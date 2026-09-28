import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import { MainLayout } from './components/MainLayout';
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { SignupScreen } from './screens/SignupScreen';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { AddPatientScreen } from './screens/AddPatientScreen';
import { PatientProfileScreen } from './screens/PatientProfileScreen';
import { MedicineReminderScreen } from './screens/MedicineReminderScreen';
import { MoodAnalysisScreen } from './screens/MoodAnalysisScreen';
import { CtScanUploadScreen } from './screens/CtScanUploadScreen';
import { QrPatientIdScreen } from './screens/QrPatientIdScreen';
import { GpsTrackingScreen } from './screens/GpsTrackingScreen';
import { EmergencySosScreen } from './screens/EmergencySosScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { DoctorDashboardScreen } from './screens/DoctorDashboardScreen';
import { AdminScreen } from './screens/AdminScreen';
import { PublicEmergencyPage } from './screens/PublicEmergencyPage';

export function App() {
  const { activeScreen, user, publicEmergencyId, setPublicEmergencyId, setActiveScreen } = useApp();

  // Listen for emergency QR scanner URLs (?patientId=...)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    let pid = searchParams.get('patientId');

    if (!pid && window.location.hash) {
      const hashStr = window.location.hash;
      if (hashStr.includes('patientId=')) {
        const parts = hashStr.split('patientId=');
        pid = parts[1] ? parts[1].split('&')[0] : null;
      }
    }

    if (pid) {
      setPublicEmergencyId(pid);
      setActiveScreen('public-emergency');
    }
  }, []);

  // 1. Unauthenticated Standalone Screens (No Sidebar)
  if (activeScreen === 'splash') return <SplashScreen />;
  if (activeScreen === 'login') return <LoginScreen />;
  if (activeScreen === 'signup') return <SignupScreen />;
  if (activeScreen === 'forgot-password') return <ForgotPasswordScreen />;
  if (activeScreen === 'public-emergency') return <PublicEmergencyPage patientId={publicEmergencyId} />;

  // 2. Main Authenticated Screens (Rendered inside Left Sidebar + Right Panel Layout)
  const renderRightPanelContent = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'add-patient':
        return <AddPatientScreen />;
      case 'patient-profile':
        return <PatientProfileScreen />;
      case 'medicine-reminder':
        return <MedicineReminderScreen />;
      case 'mood-analysis':
        return <MoodAnalysisScreen />;
      case 'ct-scan-upload':
        return <CtScanUploadScreen />;
      case 'qr-patient-id':
        return <QrPatientIdScreen />;
      case 'gps-tracking':
        return <GpsTrackingScreen />;
      case 'emergency-sos':
        return <EmergencySosScreen />;
      case 'reports':
        return <ReportsScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'doctor-dashboard':
        return <DoctorDashboardScreen />;
      case 'admin':
        return <AdminScreen />;
      default:
        return user ? <DashboardScreen /> : <LoginScreen />;
    }
  };

  return (
    <MainLayout>
      {renderRightPanelContent()}
    </MainLayout>
  );
}

export default App;
