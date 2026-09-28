import math
from flask import Blueprint, request, jsonify
from datetime import datetime
from database.db_storage import DBStorage

tracking_bp = Blueprint('tracking', __name__)

DEFAULT_SAFE_ZONE_LAT = 15.4683
DEFAULT_SAFE_ZONE_LNG = 75.0039
DEFAULT_SAFE_ZONE_RADIUS_M = 500.0

def haversine_distance_meters(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance in meters between two points 
    on the earth (specified in decimal degrees) using Haversine formula.
    """
    R = 6371000.0  # Earth's mean radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def _get_patient_safe_zone(patient_id):
    """Retrieves safe-zone center coordinates and radius for a given patient."""
    patients_dict = DBStorage.load("patients.json", {})
    patient = patients_dict.get(patient_id, {})
    if not patient and isinstance(patients_dict, dict):
        for p_val in patients_dict.values():
            if isinstance(p_val, dict) and p_val.get('id') == patient_id:
                patient = p_val
                break

    center_lat = float(patient.get('safeZoneLatitude', DEFAULT_SAFE_ZONE_LAT)) if patient else DEFAULT_SAFE_ZONE_LAT
    center_lng = float(patient.get('safeZoneLongitude', DEFAULT_SAFE_ZONE_LNG)) if patient else DEFAULT_SAFE_ZONE_LNG
    radius_m = float(patient.get('safeZoneRadiusMeters', patient.get('safeZoneRadius', DEFAULT_SAFE_ZONE_RADIUS_M))) if patient else DEFAULT_SAFE_ZONE_RADIUS_M

    return center_lat, center_lng, radius_m

@tracking_bp.route('/tracking/<patient_id>', methods=['GET'])
def get_tracking(patient_id):
    if not patient_id:
        return jsonify({'status': 'error', 'message': 'Patient ID is required'}), 400

    gps_dict = DBStorage.load("gps_logs.json", {})
    gps_history = DBStorage.load("gps_history.json", [])

    patient_history = [g for g in gps_history if isinstance(g, dict) and g.get('patientId') == patient_id]
    latest_loc = gps_dict.get(patient_id) if isinstance(gps_dict, dict) else None

    if not latest_loc and patient_history:
        latest_loc = patient_history[0]

    if latest_loc:
        return jsonify({
            'status': 'success',
            'location': latest_loc,
            'history': patient_history if patient_history else [latest_loc]
        }), 200

    # Default initial home safe zone location if no logs exist yet
    center_lat, center_lng, radius_m = _get_patient_safe_zone(patient_id)
    default_loc = {
        'id': f"gps_init_{patient_id}",
        'patientId': patient_id,
        'latitude': center_lat,
        'longitude': center_lng,
        'address': 'Home Safe Zone Area',
        'isInSafeZone': True,
        'distanceFromSafeZoneCenter': 0.0,
        'safeZoneCenter': {
            'latitude': center_lat,
            'longitude': center_lng
        },
        'safeZoneRadius': radius_m,
        'timestamp': datetime.now().isoformat()
    }

    return jsonify({
        'status': 'success',
        'location': default_loc,
        'history': [default_loc]
    }), 200

import time
from services.sms_service import SmsService

# Cooldown for automated wandering SMS alerts: 10 minutes (600 seconds)
WANDERING_ALERT_COOLDOWN_SECONDS = 600

# In-memory tracking state: { patient_id: { 'is_outside': bool, 'last_alert_timestamp': float } }
WANDERING_TRACKER = {}

def _get_patient_emergency_recipients(patient_id):
    """Resolves primary caregiver, secondary contact, and all emergency contacts for a patient."""
    patients_dict = DBStorage.load("patients.json", {})
    patient = patients_dict.get(patient_id, {})
    if not patient and isinstance(patients_dict, dict):
        for p_val in patients_dict.values():
            if isinstance(p_val, dict) and p_val.get('id') == patient_id:
                patient = p_val
                break

    patient_name = patient.get('name', 'Patient') if patient else 'Patient'
    caregiver_phone = patient.get('caregiverPhone') or patient.get('emergencyContact', '') if patient else ''
    secondary_phone = patient.get('secondaryEmergencyContact', '').strip() if patient else ''

    recipients = []
    if caregiver_phone:
        recipients.append(caregiver_phone)
    if secondary_phone:
        recipients.append(secondary_phone)

    emergency_contacts_db = DBStorage.load("emergency_contacts.json", [])
    if isinstance(emergency_contacts_db, list):
        for c in emergency_contacts_db:
            if isinstance(c, dict) and (not patient_id or c.get('patientId') == patient_id) and c.get('phone'):
                recipients.append(c['phone'])

    recipients = list(set([r.strip() for r in recipients if r and r.strip()]))
    return patient_name, recipients

def _handle_wandering_geofence_check(patient_id, lat, lng, distance_meters, radius_m, is_in_safe_zone):
    """
    Handles automatic SMS dispatch when a patient is detected outside their safe zone.
    Implements a 10-minute cooldown and resets state when returning inside.
    """
    global WANDERING_TRACKER

    if is_in_safe_zone:
        # Patient is inside safe zone: reset wandering state if previously outside
        if patient_id in WANDERING_TRACKER and WANDERING_TRACKER[patient_id].get('is_outside'):
            print(f"[Geofence] Patient {patient_id} returned inside Safe Zone. Resetting wandering alert state.")
            WANDERING_TRACKER[patient_id] = {
                'is_outside': False,
                'last_alert_timestamp': 0.0
            }
        return

    # Patient is OUTSIDE safe zone
    now_ts = time.time()
    tracker = WANDERING_TRACKER.get(patient_id, {'is_outside': False, 'last_alert_timestamp': 0.0})
    time_since_last_alert = now_ts - tracker.get('last_alert_timestamp', 0.0)

    should_send_alert = False
    if not tracker.get('is_outside'):
        # First transition from INSIDE -> OUTSIDE
        should_send_alert = True
    elif time_since_last_alert >= WANDERING_ALERT_COOLDOWN_SECONDS:
        # Patient still outside after 10-minute cooldown has elapsed
        should_send_alert = True

    if not should_send_alert:
        return

    # Update cooldown state
    WANDERING_TRACKER[patient_id] = {
        'is_outside': True,
        'last_alert_timestamp': now_ts
    }

    try:
        patient_name, recipients = _get_patient_emergency_recipients(patient_id)
        sms_dispatches = []
        has_failure = False

        for phone in recipients:
            try:
                disp = SmsService.send_wandering_alert_sms(
                    recipient_phone=phone,
                    patient_name=patient_name,
                    distance_meters=distance_meters,
                    radius_m=radius_m,
                    latitude=lat,
                    longitude=lng
                )
                sms_dispatches.append(disp)
                if disp.get('status') == 'FAILED':
                    has_failure = True
            except Exception as disp_err:
                has_failure = True
                sms_dispatches.append({
                    'status': 'FAILED',
                    'recipient': phone,
                    'error': str(disp_err),
                    'timestamp': datetime.now().isoformat()
                })

        dispatch_status = "SENT" if (not has_failure and sms_dispatches) else ("PARTIAL_FAILURE" if sms_dispatches else "NO_RECIPIENTS")

        alert_record = {
            'id': f"wandering_{int(datetime.now().timestamp() * 1000)}",
            'patientId': patient_id,
            'patientName': patient_name,
            'latitude': lat,
            'longitude': lng,
            'distanceFromSafeZoneCenter': distance_meters,
            'safeZoneRadius': radius_m,
            'timestamp': datetime.now().isoformat(),
            'recipients': recipients,
            'dispatches': sms_dispatches,
            'dispatchStatus': dispatch_status,
            'alertType': 'GPS_WANDERING'
        }

        wandering_logs = DBStorage.load("wandering_alerts.json", [])
        if not isinstance(wandering_logs, list):
            wandering_logs = []
        wandering_logs.insert(0, alert_record)
        DBStorage.save("wandering_alerts.json", wandering_logs)
        print(f"[Wandering Alert] Processed alert for {patient_name} ({patient_id}) - Status: {dispatch_status} ({len(recipients)} contacts)")

    except Exception as alert_err:
        print(f"[Wandering Alert Warning] Automated SMS trigger failed safely: {alert_err}")

@tracking_bp.route('/update_location', methods=['POST'])
def update_location():
    data = request.get_json() or {}
    patient_id = data.get('patientId')

    # Task 5: Coordinate and Patient ID Validation
    if not patient_id or not isinstance(patient_id, str) or not patient_id.strip():
        return jsonify({'status': 'error', 'message': 'Invalid or missing patientId'}), 400

    patient_id = patient_id.strip()

    try:
        raw_lat = data.get('latitude')
        raw_lng = data.get('longitude')
        if raw_lat is None or raw_lng is None:
            return jsonify({'status': 'error', 'message': 'latitude and longitude are required'}), 400
        lat = float(raw_lat)
        lng = float(raw_lng)
    except (ValueError, TypeError):
        return jsonify({'status': 'error', 'message': 'latitude and longitude must be valid numeric floats'}), 400

    if not (-90.0 <= lat <= 90.0):
        return jsonify({'status': 'error', 'message': 'latitude must be between -90 and 90 degrees'}), 400

    if not (-180.0 <= lng <= 180.0):
        return jsonify({'status': 'error', 'message': 'longitude must be between -180 and 180 degrees'}), 400

    # Task 2 & 3: Safe-Zone Resolution & Real Haversine Geofence Calculation
    center_lat, center_lng, radius_m = _get_patient_safe_zone(patient_id)
    distance_meters = round(haversine_distance_meters(lat, lng, center_lat, center_lng), 1)
    is_in_safe_zone = bool(distance_meters <= radius_m)

    loc_record = {
        'id': f"gps_{int(datetime.now().timestamp() * 1000)}",
        'patientId': patient_id,
        'latitude': lat,
        'longitude': lng,
        'address': data.get('address', f"Location ({lat:.4f}, {lng:.4f})"),
        'isInSafeZone': is_in_safe_zone,
        'distanceFromSafeZoneCenter': distance_meters,
        'safeZoneCenter': {
            'latitude': center_lat,
            'longitude': center_lng
        },
        'safeZoneRadius': radius_m,
        'timestamp': datetime.now().isoformat()
    }

    # Task 1: Persist location updates to disk via DBStorage
    gps_dict = DBStorage.load("gps_logs.json", {})
    if not isinstance(gps_dict, dict):
        gps_dict = {}
    gps_dict[patient_id] = loc_record
    DBStorage.save("gps_logs.json", gps_dict)

    gps_history = DBStorage.load("gps_history.json", [])
    if not isinstance(gps_history, list):
        gps_history = []
    gps_history.insert(0, loc_record)
    # Keep up to 500 recent history entries
    if len(gps_history) > 500:
        gps_history = gps_history[:500]
    DBStorage.save("gps_history.json", gps_history)

    # Task 6: Automated Wandering Geofence Check with 10-Minute Cooldown & SMS Dispatch
    _handle_wandering_geofence_check(patient_id, lat, lng, distance_meters, radius_m, is_in_safe_zone)

    return jsonify({
        'status': 'success',
        'location': loc_record
    }), 200

@tracking_bp.route('/wandering_alerts/<patient_id>', methods=['GET'])
def get_wandering_alerts(patient_id):
    """Retrieves wandering alerts history for a specific patient."""
    wandering_logs = DBStorage.load("wandering_alerts.json", [])
    patient_alerts = [a for a in wandering_logs if isinstance(a, dict) and a.get('patientId') == patient_id]
    return jsonify({'status': 'success', 'alerts': patient_alerts}), 200


@tracking_bp.route('/android_gps', methods=['GET'])
def android_gps_web_app():
    """Serves a lightweight, standalone mobile web GPS sender for instant testing on Android devices."""
    patients_dict = DBStorage.load("patients.json", {})
    patient_options = ""
    for pid, pval in patients_dict.items():
        if isinstance(pval, dict):
            pname = pval.get('name', 'Patient')
            pstage = pval.get('alzheimerStage', '')
            selected = 'selected' if pid == 'pat_alz_1790140707101' else ''
            patient_options += f'<option value="{pid}" {selected}>{pname} ({pstage}) - {pid}</option>\n'

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>NeuroGuardian - Android GPS Sender</title>
    <style>
        * {{ box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }}
        body {{ background: #0F172A; color: #FFFFFF; padding: 16px; min-height: 100vh; }}
        .container {{ max-width: 480px; margin: 0 auto; }}
        .header {{ text-align: center; margin-bottom: 18px; }}
        .header h1 {{ font-size: 22px; color: #00D2FF; font-weight: 800; }}
        .header p {{ font-size: 13px; color: #94A3B8; margin-top: 4px; }}
        .card {{ background: #1E293B; border-radius: 16px; padding: 16px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.1); }}
        label {{ display: block; font-size: 12px; font-weight: 700; color: #00D2FF; margin-bottom: 6px; }}
        select, input {{ width: 100%; padding: 12px; border-radius: 10px; background: #0F172A; border: 1.5px solid #334155; color: #FFF; font-size: 14px; margin-bottom: 12px; }}
        select:focus, input:focus {{ border-color: #00D2FF; outline: none; }}
        .stat-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }}
        .stat-box {{ background: #0F172A; padding: 12px; border-radius: 10px; text-align: center; }}
        .stat-label {{ font-size: 11px; color: #94A3B8; }}
        .stat-val {{ font-size: 16px; font-weight: 700; color: #38BDF8; margin-top: 4px; }}
        .badge {{ display: inline-block; padding: 8px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-align: center; width: 100%; }}
        .badge-idle {{ background: rgba(148, 163, 184, 0.2); color: #94A3B8; }}
        .badge-safe {{ background: rgba(16, 185, 129, 0.2); color: #10B981; border: 1px solid #10B981; }}
        .badge-wandering {{ background: rgba(239, 68, 68, 0.2); color: #EF4444; border: 1px solid #EF4444; }}
        .btn {{ width: 100%; padding: 14px; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; border: none; margin-bottom: 10px; }}
        .btn-start {{ background: linear-gradient(135deg, #10B981, #059669); color: #FFF; }}
        .btn-stop {{ background: linear-gradient(135deg, #EF4444, #DC2626); color: #FFF; }}
        .btn-https {{ background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: #FFF; padding: 10px 14px; font-size: 13px; margin-top: 8px; }}
        .btn:disabled {{ opacity: 0.5; cursor: not-allowed; }}
        .log {{ font-size: 11px; color: #94A3B8; text-align: center; margin-top: 8px; line-height: 1.4; }}
        .alert-box {{ background: rgba(245, 158, 11, 0.15); border: 1px solid #F59E0B; border-radius: 12px; padding: 12px; margin-bottom: 16px; font-size: 12px; color: #FCD34D; line-height: 1.4; }}
        .alert-box.secure {{ background: rgba(16, 185, 129, 0.15); border-color: #10B981; color: #6EE7B7; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧠 NeuroGuardian</h1>
            <p>Android Phone GPS Location Sender (Patient Device)</p>
        </div>

        <div id="originAlert" class="alert-box">
            Checking origin security...
        </div>

        <div class="card">
            <label>TARGET PATIENT ID:</label>
            <select id="patientSelect">
                {patient_options}
            </select>

            <label>BACKEND URL (POST /update_location):</label>
            <input type="text" id="backendUrl" value="/update_location" />
        </div>

        <div class="card">
            <div id="geofenceBadge" class="badge badge-idle">STATUS: IDLE (NOT TRACKING)</div>

            <div class="stat-grid" style="margin-top: 14px;">
                <div class="stat-box">
                    <div class="stat-label">LATITUDE</div>
                    <div class="stat-val" id="dispLat">--</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">LONGITUDE</div>
                    <div class="stat-val" id="dispLng">--</div>
                </div>
            </div>

            <div class="stat-grid">
                <div class="stat-box">
                    <div class="stat-label">DISTANCE FROM HOME</div>
                    <div class="stat-val" id="dispDist">--</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">REPORT INTERVAL</div>
                    <div class="stat-val" style="color: #00D2FF;">20 sec</div>
                </div>
            </div>

            <div class="log" id="dispLog">Ready to start tracking.</div>
        </div>

        <button id="btnStart" class="btn btn-start" onclick="startTracking()">▶ START GPS TRACKING</button>
        <button id="btnStop" class="btn btn-stop" onclick="stopTracking()" disabled>⏹ STOP TRACKING</button>
    </div>

    <script>
        let trackingInterval = null;
        let isTracking = false;

        // Check Secure Origin on page load
        (function checkSecureContext() {{
            const alertBox = document.getElementById('originAlert');
            const isSecure = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            
            if (isSecure) {{
                alertBox.className = 'alert-box secure';
                alertBox.innerHTML = '🔒 <strong>Secure Origin Active (HTTPS)</strong><br>Android Chrome will allow real-time GPS location access.';
            }} else {{
                const httpsUrl = 'https://' + window.location.hostname + ':5001' + window.location.pathname;
                alertBox.className = 'alert-box';
                alertBox.innerHTML = '⚠️ <strong>HTTP Insecure Origin Detected</strong><br>Chrome blocks phone GPS on plain HTTP across local network.<br>' +
                    '<button class="btn btn-https" onclick="window.location.href=\\'' + httpsUrl + '\\'">🔒 Switch to HTTPS (Port 5001)</button><br>' +
                    '<span style="font-size:11px; color:#94A3B8; margin-top:4px; display:inline-block;">(On first open in Chrome: tap <em>Advanced</em> &rarr; <em>Proceed to ' + window.location.hostname + '</em>)</span>';
            }}
        }})();

        function updateStatus(text, type) {{
            const badge = document.getElementById('geofenceBadge');
            badge.className = 'badge badge-' + type;
            badge.textContent = text;
        }}

        function sendGpsUpdate() {{
            if (!navigator.geolocation) {{
                document.getElementById('dispLog').textContent = "❌ Geolocation API not supported by this browser.";
                return;
            }}

            navigator.geolocation.getCurrentPosition(
                async (pos) => {{
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    const pid = document.getElementById('patientSelect').value;
                    const url = document.getElementById('backendUrl').value;

                    document.getElementById('dispLat').textContent = lat.toFixed(5);
                    document.getElementById('dispLng').textContent = lng.toFixed(5);

                    try {{
                        const res = await fetch(url, {{
                            method: 'POST',
                            headers: {{ 'Content-Type': 'application/json' }},
                            body: JSON.stringify({{ patientId: pid, latitude: lat, longitude: lng }})
                        }});

                        const data = await res.json();
                        if (data.status === 'success') {{
                            const loc = data.location;
                            const inSafe = loc.isInSafeZone;
                            const dist = loc.distanceFromSafeZoneCenter;
                            document.getElementById('dispDist').textContent = dist ? dist.toFixed(0) + ' m' : '0 m';

                            if (inSafe) {{
                                updateStatus('🟢 INSIDE SAFE ZONE (' + (dist ? dist.toFixed(0) : '0') + 'm)', 'safe');
                            }} else {{
                                updateStatus('🔴 OUTSIDE SAFE ZONE (' + (dist ? dist.toFixed(0) : '0') + 'm - WANDERING)', 'wandering');
                            }}
                            document.getElementById('dispLog').textContent = "✅ Last sent: " + new Date().toLocaleTimeString() + " (Accuracy: " + Math.round(pos.coords.accuracy) + "m)";
                        }} else {{
                            document.getElementById('dispLog').textContent = "❌ Server Error: " + (data.message || "Failed");
                        }}
                    }} catch (e) {{
                        document.getElementById('dispLog').textContent = "❌ Connection failed: " + e.message;
                    }}
                }},
                (err) => {{
                    let msg = "❌ GPS Error: " + err.message + " (Code " + err.code + ")";
                    if (err.code === 1 && !window.isSecureContext) {{
                        msg += " - Insecure origin. Please open this page via HTTPS (port 5001).";
                    }}
                    document.getElementById('dispLog').textContent = msg;
                }},
                {{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }}
            );
        }}

        function startTracking() {{
            isTracking = true;
            document.getElementById('btnStart').disabled = true;
            document.getElementById('btnStop').disabled = false;
            updateStatus('📡 TRACKING ACTIVE...', 'idle');
            document.getElementById('dispLog').textContent = "Requesting phone GPS coordinates...";
            sendGpsUpdate();
            trackingInterval = setInterval(sendGpsUpdate, 20000);
        }}

        function stopTracking() {{
            isTracking = false;
            clearInterval(trackingInterval);
            document.getElementById('btnStart').disabled = false;
            document.getElementById('btnStop').disabled = true;
            updateStatus('STATUS: STOPPED', 'idle');
            document.getElementById('dispLog').textContent = "Tracking stopped.";
        }}
    </script>
</body>
</html>"""
    return html_content, 200, {'Content-Type': 'text/html; charset=utf-8'}



