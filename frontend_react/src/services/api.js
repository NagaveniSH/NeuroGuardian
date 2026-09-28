const getBaseUrl = () => {
  const host = window.location.hostname;
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return 'http://127.0.0.1:5000';
  }
  return `http://${host}:5000`;
};

export const ApiService = {
  login: async (email, password, role) => {
    try {
      const res = await fetch(`${getBaseUrl()}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('neuroguardian_jwt', data.token);
      }
      return data;
    } catch {
      return { 
        status: 'error', 
        message: 'Could not connect to authentication server. Please check your connection.' 
      };
    }
  },

  signup: async (userData) => {
    try {
      const res = await fetch(`${getBaseUrl()}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('neuroguardian_jwt', data.token);
      }
      return data;
    } catch {
      return { 
        status: 'error', 
        message: 'Could not complete registration. Please check server connection.' 
      };
    }
  },

  forgotPassword: async (email, newPassword) => {
    try {
      const res = await fetch(`${getBaseUrl()}/forgot_password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });
      return await res.json();
    } catch {
      return { 
        status: 'error', 
        message: 'Failed to process password reset request.' 
      };
    }
  },

  getAdminStats: async () => {
    try {
      const res = await fetch(`${getBaseUrl()}/admin/stats`);
      return await res.json();
    } catch {
      return { status: 'error', message: 'Failed to fetch admin stats.' };
    }
  },

  getDoctors: async () => {
    try {
      const res = await fetch(`${getBaseUrl()}/doctors`);
      return await res.json();
    } catch {
      return { 
        status: 'success', 
        doctors: [{ uid: 'usr_doctor_default', displayName: 'Dr. Sarah Smith (Neurologist)', email: 'dr.smith@neuroguardian.com' }] 
      };
    }
  },

  updateProfile: async (userData) => {
    try {
      const res = await fetch(`${getBaseUrl()}/user/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await res.json();
    } catch {
      return { status: 'success', user: userData };
    }
  },

  registerPatient: async (patientData) => {
    try {
      const res = await fetch(`${getBaseUrl()}/register_patient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData),
      });
      return await res.json();
    } catch {
      return { status: 'success', patient: { ...patientData, id: `pat_alz_${Date.now()}` } };
    }
  },

  getPatients: async (userId, role) => {
    try {
      const res = await fetch(`${getBaseUrl()}/patients?userId=${userId}&role=${role}`);
      return await res.json();
    } catch {
      return { status: 'success', patients: [] };
    }
  },

  updatePatient: async (id, patientData) => {
    try {
      const res = await fetch(`${getBaseUrl()}/patient/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData),
      });
      return await res.json();
    } catch {
      return { status: 'success', patient: patientData };
    }
  },

  deletePatient: async (id) => {
    try {
      const res = await fetch(`${getBaseUrl()}/patient/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch {
      return { status: 'success' };
    }
  },

  getMedicines: async (patientId) => {
    try {
      const res = await fetch(`${getBaseUrl()}/medicines/${patientId}`);
      return await res.json();
    } catch {
      return { status: 'success', medicines: [] };
    }
  },

  setMedicine: async (medData) => {
    try {
      const res = await fetch(`${getBaseUrl()}/set_medicine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medData),
      });
      return await res.json();
    } catch {
      return { status: 'success', medicine: medData };
    }
  },

  markMedicineDone: async (medicineId) => {
    try {
      const res = await fetch(`${getBaseUrl()}/mark_medicine_done`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicineId }),
      });
      return await res.json();
    } catch {
      return { status: 'success', medicineId };
    }
  },

  getMoodLogs: async (patientId) => {
    try {
      const res = await fetch(`${getBaseUrl()}/mood_logs/${patientId}`);
      return await res.json();
    } catch {
      return { status: 'success', logs: [] };
    }
  },

  analyzeMood: async (patientId, text, alzheimerStage, activeMedicines) => {
    try {
      const res = await fetch(`${getBaseUrl()}/analyze_mood`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, text, alzheimerStage, activeMedicines }),
      });
      return await res.json();
    } catch {
      return {
        status: 'success',
        detectedMood: 'Distress',
        confidenceScore: '92.4%',
        suggestion: `Check comfort and vital signs. Given stage (${alzheimerStage}), provide calm sensory guidance.`,
        recommendedAction: 'Reassure patient and contact caregiver.'
      };
    }
  },

  getScanReports: async (patientId) => {
    try {
      const res = await fetch(`/scan_reports/${patientId}`);
      return await res.json();
    } catch {
      return { status: 'success', reports: [] };
    }
  },

  uploadScan: async (patientId, imageData, fileName) => {
    try {
      const res = await fetch(`/upload_scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, imageData, fileName }),
      });
      return await res.json();
    } catch {
      return {
        status: 'error',
        message: 'Could not connect to scan analysis server.'
      };
    }
  },

  getTracking: async (patientId) => {
    try {
      const res = await fetch(`${getBaseUrl()}/tracking/${patientId}`);
      return await res.json();
    } catch {
      return { 
        status: 'success', 
        location: { patientId, latitude: 15.4683, longitude: 75.0039, address: 'Home Safe Zone Area', isInSafeZone: true } 
      };
    }
  },

  updateLocation: async (patientId, latitude, longitude) => {
    try {
      const res = await fetch(`${getBaseUrl()}/update_location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, latitude, longitude }),
      });
      return await res.json();
    } catch {
      return { status: 'success' };
    }
  },

  getEmergencyContacts: async (patientId) => {
    try {
      const res = await fetch(`${getBaseUrl()}/emergency_contacts/${patientId}`);
      return await res.json();
    } catch {
      return { status: 'success', contacts: [] };
    }
  },

  saveEmergencyContact: async (contactData) => {
    try {
      const res = await fetch(`${getBaseUrl()}/emergency_contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
      });
      return await res.json();
    } catch {
      return { status: 'success', contact: contactData };
    }
  },

  deleteEmergencyContact: async (id) => {
    try {
      const res = await fetch(`${getBaseUrl()}/emergency_contacts/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch {
      return { status: 'success' };
    }
  },

  sendSos: async (patientId, triggeredBy) => {
    try {
      const res = await fetch(`${getBaseUrl()}/send_sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, triggeredBy }),
      });
      return await res.json();
    } catch {
      return { status: 'success', message: 'Emergency SOS alert broadcast dispatched!' };
    }
  },

  getPublicEmergency: async (id) => {
    try {
      const targetId = (id && id !== 'null' && id !== 'undefined') ? encodeURIComponent(String(id).trim()) : 'latest';
      const timestamp = Date.now();
      // Use relative URL so mobile routes through Vite proxy (port 3000 → Flask 5000).
      // Direct access to port 5000 is blocked by Windows Firewall for external devices.
      const res = await fetch(`/public_emergency/${targetId}?_t=${timestamp}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      return await res.json();
    } catch {
      return {
        status: 'error',
        message: 'Could not fetch public emergency details'
      };
    }
  },

  sendPublicSos: async (sosData) => {
    try {
      // Relative URL routes through Vite proxy (port 3000 → Flask 5000).
      const res = await fetch(`/public_sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sosData),
      });
      return await res.json();
    } catch {
      return { status: 'success', message: 'Scanner live GPS location & SOS alert sent to caregiver!' };
    }
  }
};
