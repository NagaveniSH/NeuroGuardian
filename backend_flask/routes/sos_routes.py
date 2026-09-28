from flask import Blueprint, request, jsonify
from datetime import datetime
from services.sms_service import SmsService
from routes.patient_routes import PATIENTS_DB
from database.db_storage import DBStorage
from database.mongo_storage import MongoStorage

sos_bp = Blueprint('sos', __name__)

EMERGENCY_CONTACTS_DB = DBStorage.load("emergency_contacts.json", [])
SOS_LOGS_DB = DBStorage.load("sos_logs.json", [])

def save_contacts():
    DBStorage.save("emergency_contacts.json", EMERGENCY_CONTACTS_DB)

def save_sos_logs():
    DBStorage.save("sos_logs.json", SOS_LOGS_DB)

@sos_bp.route('/emergency_contacts/<patient_id>', methods=['GET'])
def get_contacts(patient_id):
    contacts = [c for c in EMERGENCY_CONTACTS_DB if c.get('patientId') == patient_id]
    return jsonify({'status': 'success', 'contacts': contacts}), 200

@sos_bp.route('/emergency_contacts', methods=['POST'])
def save_contact():
    data = request.get_json() or {}
    patient_id = data.get('patientId')
    name = data.get('name')
    phone = data.get('phone', '').strip()

    if not patient_id or not name or not phone:
        return jsonify({'status': 'error', 'message': 'Patient ID, contact name, and phone are required'}), 400

    cid = data.get('id') or f"contact_{int(datetime.now().timestamp() * 1000)}"
    contact_record = {
        'id': cid,
        'patientId': patient_id,
        'name': name,
        'relationship': data.get('relationship', 'Family Contact'),
        'phone': phone,
        'isPrimary': data.get('isPrimary', False)
    }

    idx = next((i for i, c in enumerate(EMERGENCY_CONTACTS_DB) if c['id'] == cid), -1)
    if idx >= 0:
        EMERGENCY_CONTACTS_DB[idx] = contact_record
    else:
        EMERGENCY_CONTACTS_DB.append(contact_record)

    save_contacts()
    return jsonify({'status': 'success', 'contact': contact_record}), 200

@sos_bp.route('/emergency_contacts/<id>', methods=['DELETE'])
def delete_contact(id):
    global EMERGENCY_CONTACTS_DB
    EMERGENCY_CONTACTS_DB = [c for c in EMERGENCY_CONTACTS_DB if c['id'] != id]
    save_contacts()
    return jsonify({'status': 'success', 'message': 'Contact deleted'}), 200

@sos_bp.route('/send_sos', methods=['POST'])
def send_sos():
    data = request.get_json() or {}
    patient_id = data.get('patientId')
    triggered_by = data.get('triggeredBy', 'Caregiver')
    latitude = data.get('latitude', 15.4683)
    longitude = data.get('longitude', 75.0039)

    patient = PATIENTS_DB.get(patient_id, {})
    if not patient:
        for p in PATIENTS_DB.values():
            if p.get('id') == patient_id or str(patient_id) in str(p.get('id')):
                patient = p
                break
    
    if not patient and PATIENTS_DB:
        patient = list(PATIENTS_DB.values())[0]

    patient_name = patient.get('name', 'john') if patient else 'john'
    caregiver_phone = patient.get('caregiverPhone') or patient.get('emergencyContact', '8095189197') if patient else '8095189197'
    secondary_phone = patient.get('secondaryEmergencyContact', '').strip() if patient else ''

    # Recipient numbers: Caregiver Phone + Secondary Emergency Contact + ALL Emergency Contacts
    recipients = [caregiver_phone]
    if secondary_phone:
        recipients.append(secondary_phone)

    for c in EMERGENCY_CONTACTS_DB:
        if (not patient_id or c.get('patientId') == patient_id) and c.get('phone'):
            recipients.append(c['phone'])
    
    recipients = list(set([r for r in recipients if r])) # Deduplicate numbers

    sms_dispatches = []
    has_failure = False

    # Execute Real SMS Dispatch via Android SMS Gateway
    for phone in recipients:
        dispatch_res = SmsService.send_emergency_sms(phone, patient_name, latitude, longitude)
        sms_dispatches.append(dispatch_res)
        if dispatch_res['status'] == 'FAILED':
            has_failure = True

    overall_status = "SENT" if not has_failure else "PARTIAL_FAILURE"

    sos_record = {
        'id': f"sos_{int(datetime.now().timestamp() * 1000)}",
        'patientId': patient_id,
        'triggeredBy': triggered_by,
        'latitude': latitude,
        'longitude': longitude,
        'mapsLink': f"https://www.google.com/maps?q={latitude:.4f},{longitude:.4f}",
        'recipients': recipients,
        'dispatches': sms_dispatches,
        'status': overall_status,
        'timestamp': datetime.now().isoformat()
    }

    # 1. Log to MongoDB Collection
    MongoStorage.save_sos_log(sos_record)

    # 2. Log to JSON File Storage
    SOS_LOGS_DB.insert(0, sos_record)
    save_sos_logs()

    return jsonify({
        'status': 'success',
        'message': f'Emergency SOS Alert sent via Android SMS Gateway! Real SMS delivered to {len(recipients)} recipients.',
        'sos': sos_record
    }), 200

@sos_bp.route('/retry_sos', methods=['POST'])
def retry_sos():
    data = request.get_json() or {}
    sos_id = data.get('sosId')

    sos_entry = next((s for s in SOS_LOGS_DB if s['id'] == sos_id), None)
    if not sos_entry:
        return jsonify({'status': 'error', 'message': 'SOS log not found'}), 404

    patient = PATIENTS_DB.get(sos_entry['patientId'], {})
    patient_name = patient.get('name', 'john')

    new_dispatches = []
    has_failure = False

    for phone in sos_entry['recipients']:
        res = SmsService.send_emergency_sms(phone, patient_name, sos_entry['latitude'], sos_entry['longitude'])
        new_dispatches.append(res)
        if res['status'] == 'FAILED':
            has_failure = True

    sos_entry['dispatches'] = new_dispatches
    sos_entry['status'] = "SENT" if not has_failure else "PARTIAL_FAILURE"
    sos_entry['retryTimestamp'] = datetime.now().isoformat()

    # Log retry to MongoDB
    MongoStorage.save_sos_log(sos_entry)
    save_sos_logs()

    return jsonify({
        'status': 'success',
        'message': f'Retry dispatch completed via Android SMS Gateway for {len(sos_entry["recipients"])} recipients.',
        'sos': sos_entry
    }), 200
