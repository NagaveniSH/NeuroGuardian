from flask import Blueprint, request, jsonify
import re
from datetime import datetime
from database.db_storage import DBStorage

patient_bp = Blueprint('patient', __name__)

PATIENTS_DB = DBStorage.load("patients.json", {})

def save_patients():
    DBStorage.save("patients.json", PATIENTS_DB)

def validate_phone(phone_str):
    """Validates that a phone number contains exactly 10 numeric digits"""
    if not phone_str:
        return True
    cleaned = str(phone_str).strip()
    return bool(re.match(r'^\d{10}$', cleaned))

@patient_bp.route('/register_patient', methods=['POST'])
def register_patient():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    caregiver_id = data.get('caregiverId', '').strip()
    caregiver_phone = data.get('caregiverPhone', '').strip()
    emergency_contact = data.get('emergencyContact', '').strip()
    secondary_emergency_contact = data.get('secondaryEmergencyContact', '').strip()

    if not name or not caregiver_id:
        return jsonify({'status': 'error', 'message': 'Patient name and caregiver ID are required'}), 400

    if caregiver_phone and not validate_phone(caregiver_phone):
        return jsonify({'status': 'error', 'message': 'Phone number must contain exactly 10 digits.'}), 400

    if emergency_contact and not validate_phone(emergency_contact):
        return jsonify({'status': 'error', 'message': 'Phone number must contain exactly 10 digits.'}), 400

    if secondary_emergency_contact and not validate_phone(secondary_emergency_contact):
        return jsonify({'status': 'error', 'message': 'Secondary emergency contact phone must contain exactly 10 digits.'}), 400

    patient_id = f"pat_alz_{int(datetime.now().timestamp() * 1000)}"
    patient_record = {
        'id': patient_id,
        'name': name,
        'age': data.get('age', 70),
        'gender': data.get('gender', 'Male'),
        'address': data.get('address', ''),
        'caregiverId': caregiver_id,
        'caregiverName': data.get('caregiverName', 'Caregiver'),
        'caregiverPhone': caregiver_phone or '9876543210',
        'emergencyContact': emergency_contact or '9876543210',
        'secondaryEmergencyContact': secondary_emergency_contact or '',
        'bloodGroup': data.get('bloodGroup', 'O+'),
        'allergies': data.get('allergies', 'None reported'),
        'emergencyInstructions': data.get('emergencyInstructions', 'Keep patient calm and contact caregiver immediately.'),
        'alzheimerStage': data.get('alzheimerStage', 'Mild Cognitive Impairment (Early Stage)'),
        'assignedDoctorId': data.get('assignedDoctorId', 'usr_doctor_default'),
        'assignedDoctorName': data.get('assignedDoctorName', 'Dr. Sarah Smith'),
        'medicalNotes': data.get('medicalNotes', ''),
        'createdAt': datetime.now().isoformat()
    }
    
    PATIENTS_DB[patient_id] = patient_record
    save_patients()
    return jsonify({'status': 'success', 'patient': patient_record}), 201

@patient_bp.route('/patients', methods=['GET'])
def get_patients():
    user_id = request.args.get('userId', '')
    role = request.args.get('role', 'caregiver').lower()

    if role == 'caregiver':
        filtered = [p for p in PATIENTS_DB.values() if p.get('caregiverId') == user_id]
    elif role == 'doctor':
        filtered = [p for p in PATIENTS_DB.values() if p.get('assignedDoctorId') == user_id or p.get('assignedDoctorId') == 'usr_doctor_default']
    elif role == 'admin':
        filtered = list(PATIENTS_DB.values())
    else:
        filtered = []

    return jsonify({'status': 'success', 'patients': filtered}), 200

@patient_bp.route('/patient/<id>', methods=['GET'])
def get_patient(id):
    patient = PATIENTS_DB.get(id)
    if not patient:
        return jsonify({'status': 'error', 'message': 'Patient record not found'}), 404
    return jsonify({'status': 'success', 'patient': patient}), 200

@patient_bp.route('/patient/<id>', methods=['PUT', 'POST'])
def update_patient(id):
    if id not in PATIENTS_DB:
        return jsonify({'status': 'error', 'message': 'Patient record not found'}), 404

    data = request.get_json() or {}
    caregiver_phone = data.get('caregiverPhone', '').strip()
    emergency_contact = data.get('emergencyContact', '').strip()
    secondary_emergency_contact = data.get('secondaryEmergencyContact', '').strip() if 'secondaryEmergencyContact' in data else None

    if caregiver_phone and not validate_phone(caregiver_phone):
        return jsonify({'status': 'error', 'message': 'Phone number must contain exactly 10 digits.'}), 400

    if emergency_contact and not validate_phone(emergency_contact):
        return jsonify({'status': 'error', 'message': 'Phone number must contain exactly 10 digits.'}), 400

    if secondary_emergency_contact and not validate_phone(secondary_emergency_contact):
        return jsonify({'status': 'error', 'message': 'Secondary emergency contact phone must contain exactly 10 digits.'}), 400

    patient = PATIENTS_DB[id]

    # Perform UPDATE operation - preserve Patient ID
    for field in ['name', 'age', 'gender', 'address', 'caregiverName', 'caregiverPhone', 'emergencyContact', 'secondaryEmergencyContact', 'bloodGroup', 'allergies', 'emergencyInstructions', 'alzheimerStage', 'assignedDoctorId', 'assignedDoctorName', 'medicalNotes']:
        if field in data:
            patient[field] = data[field]

    patient['updatedAt'] = datetime.now().isoformat()
    PATIENTS_DB[id] = patient
    save_patients()
    return jsonify({'status': 'success', 'message': 'Patient record updated successfully', 'patient': patient}), 200

@patient_bp.route('/patient/<id>', methods=['DELETE'])
def delete_patient(id):
    if id in PATIENTS_DB:
        del PATIENTS_DB[id]
        save_patients()
        return jsonify({'status': 'success', 'message': 'Patient record deleted'}), 200
    return jsonify({'status': 'error', 'message': 'Patient not found'}), 404
