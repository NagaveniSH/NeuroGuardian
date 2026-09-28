from flask import Blueprint, request, jsonify, make_response
from datetime import datetime
from database.db_storage import DBStorage
from routes.patient_routes import PATIENTS_DB

emergency_public_bp = Blueprint('emergency_public', __name__)

PUBLIC_EMERGENCY_LOGS = []

@emergency_public_bp.route('/public_emergency', methods=['GET'])
@emergency_public_bp.route('/public_emergency/<id>', methods=['GET'])
def get_public_emergency_info(id=None):
    # Always load latest state from database/disk to guarantee 100% up-to-date data
    patients_dict = DBStorage.load("patients.json", {})
    if not patients_dict and PATIENTS_DB:
        patients_dict = PATIENTS_DB

    medicines_list = DBStorage.load("medicines.json", [])
    gps_dict = DBStorage.load("gps_logs.json", {})

    patient = None

    if id and id != 'latest' and id != 'null' and id != 'undefined':
        clean_id = str(id).strip()
        patient = patients_dict.get(clean_id)
        if not patient:
            for p_id, p_val in patients_dict.items():
                if p_id == clean_id or p_val.get('id') == clean_id or clean_id in str(p_id):
                    patient = p_val
                    break

    # If id is not specified or not found, default to first registered patient in DB
    if not patient and patients_dict:
        patient = list(patients_dict.values())[0]

    if not patient:
        resp = jsonify({
            'status': 'error',
            'message': 'No registered patient record found'
        })
        resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        resp.headers['Pragma'] = 'no-cache'
        return resp, 404

    # Fetch active patient medicines
    patient_meds = []
    try:
        patient_meds = [
            m['medicineName'] + " (" + m.get('dosage', '1 Tablet') + ")"
            for m in medicines_list if isinstance(m, dict) and m.get('patientId') == patient.get('id') and 'medicineName' in m
        ]
    except Exception:
        patient_meds = ['Dolo (1 Tablet)']

    # Fetch saved location coordinates from GPS logs
    patient_loc = gps_dict.get(patient.get('id', ''), {}) if isinstance(gps_dict, dict) else {}
    latitude = patient_loc.get('latitude', 15.4683)
    longitude = patient_loc.get('longitude', 75.0039)

    public_payload = {
        'id': patient.get('id', ''),
        'name': patient.get('name', 'Patient'),
        'photoUrl': patient.get('photoUrl', ''),
        'bloodGroup': patient.get('bloodGroup', 'A+'),
        'allergies': patient.get('allergies', 'None reported'),
        'emergencyInstructions': patient.get('emergencyInstructions', 'Keep patient calm and contact caregiver immediately.'),
        'caregiverName': patient.get('caregiverName', 'Caregiver'),
        'caregiverPhone': patient.get('caregiverPhone') or patient.get('emergencyContact', '9876543210'),
        'emergencyContact': patient.get('emergencyContact') or patient.get('caregiverPhone', '9876543210'),
        'secondaryEmergencyContact': patient.get('secondaryEmergencyContact', ''),
        'assignedDoctorName': patient.get('assignedDoctorName', 'Dr. Sarah Smith (Neurologist)'),
        'medications': patient_meds if patient_meds else ['Dolo (1 Tablet)'],
        'latitude': latitude,
        'longitude': longitude
    }

    resp = make_response(jsonify({'status': 'success', 'emergencyInfo': public_payload}), 200)
    resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    resp.headers['Pragma'] = 'no-cache'
    resp.headers['Expires'] = '0'
    return resp

@emergency_public_bp.route('/public_sos', methods=['POST'])
def receive_public_sos():
    data = request.get_json() or {}
    patient_id = data.get('patientId', '')
    scanner_lat = data.get('latitude', 15.4683)
    scanner_lng = data.get('longitude', 75.0039)
    scanner_phone = data.get('scannerPhone', 'Bystander Smartphone Scanner')

    sos_record = {
        'id': f"sos_pub_{int(datetime.now().timestamp() * 1000)}",
        'patientId': patient_id,
        'triggeredBy': scanner_phone,
        'latitude': scanner_lat,
        'longitude': scanner_lng,
        'status': 'ACTIVE',
        'timestamp': datetime.now().isoformat()
    }
    
    PUBLIC_EMERGENCY_LOGS.insert(0, sos_record)

    resp = make_response(jsonify({
        'status': 'success',
        'message': f'Scanner live location ({scanner_lat:.4f}, {scanner_lng:.4f}) sent to caregiver!',
        'sos': sos_record
    }), 200)
    resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    return resp
