# 🧠 NeuroGuardian

**AI-Powered Alzheimer's Assistance & Real-Time Patient Safety System**

NeuroGuardian is a comprehensive, production-grade healthcare monitoring and safety platform specifically engineered for Alzheimer's patients, caregivers, and medical practitioners.

---

## 🌟 Key Capabilities

### 1. 🔬 Deep Learning Alzheimer's Brain Scan Diagnosis
- **EfficientNet-B0 Architecture**: Preloaded in-memory PyTorch neural model (`best_alzheimer_efficientnetb0.pth`) achieving 99.4% validation accuracy.
- **4-Class Dementia Staging**:
  - `Mild_Demented`
  - `Moderate_Demented`
  - `Non_Demented`
  - `Very_Mild_Demented`
- **Clinical Confidence Scoring & Medical Disclaimer**: Delivers instant confidence percentages, stage assessments, and doctor consultation advice.

### 2. 📍 Real-Time GPS Tracking & 500m Geofence
- **Patient Phone GPS Source**: Real GPS coordinates acquired from patient device via native Android service or mobile web client (`/android_gps`).
- **Spherical Haversine Geofencing**: Real-time great-circle distance calculation against patient's registered home safe zone center.
- **Live Caregiver Dashboard**: 10-second automatic polling, dynamic vector map with pulsing radar, and live distance telemetry.

### 3. 🚨 Automated Safe-Zone Wandering SMS Alerts
- **Immediate Boundary Breach Trigger**: Automatically dispatches cellular SMS alerts the moment a patient exits the 500m safe perimeter.
- **10-Minute Cooldown & State Reset**: Intelligent anti-spam debouncing with automated state reset when patient returns inside.
- **Android SMS Gateway (Capcom6)**: REST API integration (`POST /message` with Basic Auth) sending real SMS via local cellular SIM.

### 4. 🆘 Emergency Direct Call & QR Public Scanner
- **One-Touch Direct Calling**: High-priority phone dialer triggers for primary and fallback caregivers.
- **Scannable QR Digital Health Card**: Public emergency profile for bystanders to view vital health info and broadcast scanner GPS.

### 5. 💊 Medicine Reminders & AI Mood Sentiment
- **Daily Prescription Tracker**: Morning, Afternoon, and Night medication schedules.
- **NLP Mood Sentiment Engine**: Real-time emotion classification with dementia-specific sensory reassurance tips.

---

## 🏗️ System Architecture

```
                               ┌────────────────────────────────┐
                               │     Patient Android Device     │
                               │  (Mobile GPS Sender /android_gps)
                               └───────────────┬────────────────┘
                                               │ (GPS Coords over HTTPS)
                                               ▼
┌───────────────────────┐            ┌───────────────────┐            ┌────────────────────────┐
│  Caregiver Frontend   │ ◄───────── │   Flask Backend   │ ─────────► │  Capcom6 SMS Gateway   │
│ (React 18 + Vite Web) │ (Telemetry)│ (Python REST API) │ (SMS Alert)│   (Android SIM Phone)  │
└───────────────────────┘            └─────────┬─────────┘            └────────────────────────┘
                                               │
                                 ┌─────────────┴─────────────┐
                                 │ PyTorch EfficientNetB0 AI │
                                 │ Alzheimer Diagnostic Model│
                                 └───────────────────────────┘
```

---

## 📁 Repository Structure

```
neuroguardian/
├── alzheimer_model_package/      # PyTorch Model Checkpoint, Class Labels, Config
│   ├── best_alzheimer_efficientnetb0.pth
│   ├── class_names.json
│   └── preprocessing_config.json
├── android_gps_sender/           # Native Android Kotlin GPS Background Sender App
├── backend_flask/                # Python Flask REST API Server
│   ├── routes/                   # Scan, Tracking, SOS, Patient, Mood, Medicine Routes
│   ├── services/                 # AI Scan, SMS Gateway, SSL Cert Generator
│   └── database/data/            # Persistent JSON & MongoDB Data Stores
├── frontend_react/               # Caregiver Glassmorphic React Application
├── frontend_flutter/             # Flutter Mobile Client Application
├── database/                     # Seed Scripts & Schema Definitions
└── documentation/                # Architecture & Deployment Guides
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ & npm
- **Python**: v3.10+ (with `torch`, `torchvision`, `cryptography`, `flask`, `flask-cors`)

### 2. Backend Setup
```bash
cd backend_flask
pip install -r requirements.txt
python app.py
```
* HTTP API running at: `http://localhost:5000`
* Secure Android GPS Receiver at: `https://<YOUR_LAN_IP>:5001/android_gps`

### 3. Frontend Setup
```bash
cd frontend_react
npm install
npm run dev
```
* Caregiver Portal running at: `http://localhost:3000`

---

## 🔒 Security Notice
All sensitive environment variables, private SSL keys (`*.pem`), and gateway credentials are strictly excluded via `.gitignore`.
