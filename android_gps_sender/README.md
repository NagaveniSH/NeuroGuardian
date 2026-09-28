# 📱 NeuroGuardian Android Phone GPS Location Sender

This module provides the patient-side GPS location tracking component for **NeuroGuardian**.

The Android phone is carried by the Alzheimer's patient and periodically reports real-time GPS coordinates to the existing NeuroGuardian Flask backend (`POST /update_location`).

---

## 🏗️ Architecture

```
Android Phone (Carried by Patient)
        ↓ (Android Location API / Fused Location)
Periodic GPS Acquisition (15–30s interval)
        ↓ (HTTP POST /update_location)
NeuroGuardian Flask Backend (http://<LAN_IP>:5000)
        ↓
Atomic Persistence (gps_logs.json & gps_history.json)
        ↓
Haversine Geofence Calculation (<= 500m Safe Radius)
        ↓
Caregiver Dashboard Live Monitoring (GpsTrackingScreen.jsx)
```

---

## 🚀 Two Testing Options Available

### Option 1: Instant In-Browser Mobile Testing (Zero Setup Required)
Any Android smartphone on the same Wi-Fi network can immediately run the location sender by opening:

👉 **`http://192.168.1.11:5000/android_gps`**

1. Select the target patient from the dropdown (e.g. `Ram (pat_alz_1790140707101)`).
2. Tap **▶ START GPS TRACKING**.
3. Allow Location permission on the Android phone.
4. The phone will acquire real GPS coordinates and report them every 20 seconds.
5. The live safe-zone status and distance from the home center are displayed in real-time.

---

### Option 2: Native Android Application (Android Studio)
The complete native Android project is located in this directory:

* `app/src/main/AndroidManifest.xml`: Declares `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, and `INTERNET`.
* `app/src/main/java/com/neuroguardian/gpssender/MainActivity.kt`: Native Kotlin activity with location listener, interval handler, and HTTP client.
* `app/src/main/res/layout/activity_main.xml`: Clean Dark-Mode layout.
* `app/build.gradle.kts`: Gradle configuration compatible with Android SDK 24–34.

#### To Run in Android Studio:
1. Open Android Studio.
2. Select **Open** and choose `neuroguardian/android_gps_sender`.
3. Connect your Android device via USB (or wireless debugging).
4. Click **Run 'app'**.
5. On the phone, enter the laptop's LAN IP URL: `http://192.168.1.11:5000/update_location`.
6. Tap **START TRACKING**.

---

## 🔒 Safety & Compatibility
* Reuses the existing `POST /update_location` endpoint.
* No changes to AI models, medical scanning, authentication, or patient databases.
* Validates coordinates and computes Haversine geofencing dynamically.
