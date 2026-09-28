# NeuroGuardian - Final-Year Engineering Project Demonstration Script

## Project Title
**NeuroGuardian: AI-Powered Alzheimer's Assistance and Brain Health Monitoring System**

---

## 1. Project Introduction & Problem Statement (2 Mins)

- **Problem**: Alzheimer's disease causes progressive cognitive decline, memory impairment, disorientation, and emotional distress. Caregivers face immense pressure managing daily medicine schedules, tracking patient movements, monitoring emotional states, and responding to emergency wandering.
- **Solution**: **NeuroGuardian** provides a specialized mobile healthcare platform featuring:
  - Glassmorphic Material 3 elderly-friendly UI
  - Real-time caregiver dashboard
  - Digital Healthcare QR Card
  - Scheduled medicine reminders with local alerts
  - Rule-based text/voice mood sentiment analysis with counseling tips
  - Future-ready AI CT scan assessment
  - Google Maps GPS Safe Zone tracking & Geofence alerts
  - One-touch Emergency SOS broadcast

---

## 2. Demonstration Flow (8 Mins)

### Step 1: Onboarding & Authentication
1. Launch `NeuroGuardian` app -> Opens **Splash Screen** with glowing brain logo.
2. Tap "Get Started" -> Role Selection (**Caregiver**, **Patient**, **Doctor**).
3. Log in using caregiver credentials (`caregiver@neuroguardian.com`).

### Step 2: Dashboard Overview
1. Show the 6 core module cards (Brain Scan, Mood Analysis, Patient QR ID, GPS Tracking, Reports, Emergency SOS).
2. Point out the active patient status card for **Robert Vance** (Mild Cognitive Impairment).
3. Review the **Medicine Reminder Banner** and **Caregiver System Alerts**.

### Step 3: Patient Management & Digital QR Card
1. Open Patient Profile -> View details.
2. Tap "View Digital QR Health ID" -> Scannable QR code generated with `qr_flutter`.

### Step 4: Caregiver Medicine Schedule
1. Open Medicine Reminder -> Show Morning, Afternoon, and Night medications.
2. Tap `+` button -> Open add medicine dialog and schedule a new dose.
3. Check off a medication -> Strikethrough completed status & update local notifications.

### Step 5: AI Mood Analysis Engine
1. Open Mood Analysis.
2. Dictate/Type: *"Patient felt confused about where their car key was stored."*
3. Tap "Analyze Emotion & Get Tips" -> Detects **Confused** (😕), logs history, and displays specific counseling advice: *"Maintain orientation cues, keep keys in fixed labelled box, and offer calm reassurance."*

### Step 6: CT Brain Scan AI Module
1. Open Brain CT Scan Analysis.
2. Select CT scan image -> Tap "Run AI Neural Assessment".
3. Review AI prediction output: **82.1% Alzheimer Risk**, **Moderate Stage**, **95.6% Confidence**, and mandatory medical disclaimer notice.

### Step 7: GPS Safe Zone Tracking & Emergency SOS
1. Open GPS Tracking -> Show live Google Maps container with 500m Home Geofence radius.
2. Open Emergency SOS -> Tap glowing red SOS button -> Show broadcast notification and quick direct calling buttons ("Call Son", "Call Daughter").

### Step 8: Analytics & Backend Verification
1. Open Reports -> Display consolidated charts and compliance stats.
2. Demonstrate Python Flask REST server running on port 5000 with live API responses.

---

## 3. Technology Stack Summary

- **Frontend**: Flutter (Material 3), Provider, Glassmorphism UI, Google Fonts, Local Notifications, Google Maps, Geolocator, QR Flutter.
- **Backend**: Python Flask, Flask REST APIs, Flask-CORS.
- **Database & Storage**: Firebase Authentication, Cloud Firestore, Firebase Storage.
