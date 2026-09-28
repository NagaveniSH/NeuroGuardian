# NeuroGuardian - AI-Powered Alzheimer's Assistance and Brain Health Monitoring System

NeuroGuardian is a production-quality healthcare mobile application specifically engineered for **Alzheimer's disease** patients and their caregivers.

## Key Features

- 🔒 **Firebase Authentication**: Caregiver and Patient secure login, registration, and password recovery.
- 📱 **Elderly-Friendly UI**: Modern Glassmorphic design system using Material 3 with large readable fonts, high contrast, soft shadows, and smooth micro-animations.
- 🩺 **Patient Management**: Complete CRUD operations for patient records, medical notes, and Alzheimer's stage classification.
- 🎴 **Digital Healthcare QR Card**: Instant offline-accessible digital ID and QR code generation for emergency identity verification.
- 💊 **Caregiver Medicine Reminders**: Schedule Morning, Afternoon, and Night medications with local notifications.
- 🧠 **AI Mood Analysis**: Rule-based text sentiment processing to detect emotional distress (Happy, Sad, Angry, Confused, Anxious) and suggest personalized counseling tips.
- 🔬 **CT Scan Upload & Future AI Prediction**: Ready architecture for uploading CT brain scans, displaying risk percentages, estimated Alzheimer stage, and medical advice disclaimers.
- 📍 **GPS Safe Zone & Live Tracking**: Real-time Google Maps integration showing patient coordinates, history, and safe boundary zones.
- 🚨 **One-Touch Emergency SOS**: Instant emergency triggers with quick direct calling and location sharing to caregivers.
- 📊 **Analytics & Reports**: Visual history logs for medication compliance, mood trends, scans, and emergency events.

## Architecture

- `frontend_flutter/`: Flutter mobile application (Provider state management, Clean Architecture, Glass UI).
- `backend_flask/`: Python Flask REST API server.
- `database/`: Firestore collection schema definitions and database seed script.
- `documentation/`: Project specifications and guidelines.
