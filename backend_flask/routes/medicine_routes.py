from flask import Blueprint, request, jsonify
from datetime import datetime
from database.db_storage import DBStorage

medicine_bp = Blueprint('medicine', __name__)

# Persistent Medicines Store (Saved to disk: medicines.json)
MEDICINES_DB = DBStorage.load("medicines.json", [])

def save_medicines():
    DBStorage.save("medicines.json", MEDICINES_DB)

@medicine_bp.route('/set_medicine', methods=['POST'])
def set_medicine():
    data = request.get_json() or {}
    patient_id = data.get('patientId')
    name = data.get('medicineName')

    if not patient_id or not name:
        return jsonify({'status': 'error', 'message': 'Patient ID and Medicine Name are required'}), 400

    med_id = data.get('id') or f"med_{int(datetime.now().timestamp() * 1000)}"
    
    # Process multiple reminder times array
    reminder_times = data.get('reminderTimes')
    if not reminder_times:
        single_time = data.get('timeOfDay', data.get('timing', '08:00 AM'))
        reminder_times = [single_time]

    med_record = {
        'id': med_id,
        'patientId': patient_id,
        'medicineName': name,
        'dosage': data.get('dosage', '1 tablet'),
        'frequency': data.get('frequency', 'Once Daily'),
        'reminderTimes': reminder_times,
        'timeOfDay': reminder_times[0] if reminder_times else '08:00 AM',
        'mealTiming': data.get('mealTiming', 'After Food'),
        'startDate': data.get('startDate', datetime.now().strftime('%Y-%m-%d')),
        'endDate': data.get('endDate', ''),
        'notes': data.get('notes', ''),
        'instructions': data.get('instructions', data.get('notes', 'Take with water')),
        'isCompletedToday': data.get('isCompletedToday', False),
        'completedTimes': data.get('completedTimes', []),
        'createdAt': datetime.now().isoformat()
    }

    existing_idx = next((i for i, m in enumerate(MEDICINES_DB) if m['id'] == med_id), -1)
    if existing_idx >= 0:
        MEDICINES_DB[existing_idx] = med_record
    else:
        MEDICINES_DB.append(med_record)

    save_medicines()
    return jsonify({'status': 'success', 'medicine': med_record}), 200

@medicine_bp.route('/medicines/<patient_id>', methods=['GET'])
def get_medicines(patient_id):
    patient_meds = [m for m in MEDICINES_DB if m.get('patientId') == patient_id]
    return jsonify({'status': 'success', 'medicines': patient_meds}), 200

@medicine_bp.route('/mark_medicine_done', methods=['POST'])
def mark_medicine_done():
    data = request.get_json() or {}
    med_id = data.get('medicineId')
    time_slot = data.get('timeSlot')
    
    for m in MEDICINES_DB:
        if m['id'] == med_id:
            if time_slot:
                completed = m.get('completedTimes', [])
                if time_slot in completed:
                    completed.remove(time_slot)
                else:
                    completed.append(time_slot)
                m['completedTimes'] = completed
                m['isCompletedToday'] = len(completed) >= len(m.get('reminderTimes', [1]))
            else:
                m['isCompletedToday'] = not m.get('isCompletedToday', False)

            save_medicines()
            return jsonify({'status': 'success', 'medicine': m}), 200

    return jsonify({'status': 'error', 'message': 'Medicine record not found'}), 404
