# NeuroGuardian Production Deployment Guide

This document contains step-by-step instructions for deploying both the Flutter frontend mobile/web applications and the Python Flask REST API server to production environments.

---

## 1. Prerequisites

- Flutter SDK (v3.0.0+)
- Python (v3.10+)
- Firebase Account & Cloud Firestore instance
- Google Maps API Key (with Maps SDK for Android/iOS enabled)

---

## 2. Python Flask Backend Deployment

### Local Development / Staging:
```bash
cd neuroguardian/backend_flask
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Production Deployment (Linux Gunicorn + Nginx + Systemd):
1. **Gunicorn Server Execution**:
   ```bash
   gunicorn --workers 4 --bind 0.0.0.0:5000 app:app
   ```
2. **Environment Variables**:
   Ensure `.env` contains:
   ```env
   FLASK_ENV=production
   DEBUG=False
   PORT=5000
   SECRET_KEY=production_strong_secret_key_here
   FIREBASE_CREDENTIALS_PATH=/etc/neuroguardian/firebase_creds.json
   ```

---

## 3. Flutter Mobile & Web Deployment

### Android Production APK Build:
```bash
cd neuroguardian/frontend_flutter
flutter pub get
flutter build apk --release
```
The output APK is generated at:
`frontend_flutter/build/app/outputs/flutter-apk/app-release.apk`

### Flutter Web Release Build:
```bash
flutter build web --release
```
The web static bundle is generated at:
`frontend_flutter/build/web/`

---

## 4. Firebase Firestore Security Rules

Set the following security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    match /patients/{patientId} {
      allow read, write: if request.auth != null;
    }
    match /medicines/{medId} {
      allow read, write: if request.auth != null;
    }
    match /mood_logs/{logId} {
      allow read, write: if request.auth != null;
    }
    match /scan_reports/{scanId} {
      allow read, write: if request.auth != null;
    }
    match /emergency_logs/{sosId} {
      allow read, write: if request.auth != null;
    }
  }
}
```
