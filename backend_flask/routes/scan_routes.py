from flask import Blueprint, request, jsonify
from datetime import datetime
from services.ai_scan_service import AiScanService
from database.db_storage import DBStorage

scan_bp = Blueprint('scan', __name__)

# Persistent Scan Reports Store (Saved to disk: scan_reports.json)
SCAN_REPORTS_DB = DBStorage.load("scan_reports.json", [])

def save_scan_reports():
    DBStorage.save("scan_reports.json", SCAN_REPORTS_DB)

@scan_bp.route('/upload_scan', methods=['POST'])
def upload_scan():
    data = request.get_json() or {}
    patient_id = data.get('patientId')
    image_data = data.get('imageData')
    file_name = data.get('fileName', 'brain_ct_slice.png')

    if not image_data and not request.files:
        return jsonify({'status': 'error', 'message': 'No CT scan image payload uploaded. Please select a valid CT scan image file.'}), 400

    try:
        prediction = AiScanService.predict_alzheimer_risk(image_data)
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'AI Model Inference Failed: {str(e)}'}), 500

    report_record = {
        'id': f"scan_{int(datetime.now().timestamp() * 1000)}",
        'patientId': patient_id,
        'fileName': file_name,
        'predictedClass': prediction.get('predictedClass', 'VeryMildDemented'),
        'alzheimerRisk': prediction['alzheimerRisk'],
        'stage': prediction['stage'],
        'aiConfidence': prediction['aiConfidence'],
        'probabilityDistribution': prediction.get('probabilityDistribution', {}),
        'heatmapRegion': prediction.get('heatmapRegion', 'Minimal Entorhinal Cortex Atrophy'),
        'recommendation': prediction.get('recommendation', 'Consult neurologist for evaluation.'),
        'disclaimer': prediction['disclaimer'],
        'timestamp': datetime.now().isoformat()
    }

    SCAN_REPORTS_DB.insert(0, report_record)
    save_scan_reports() # Save directly to disk

    return jsonify({
        'status': 'success',
        'message': 'CT Scan image uploaded successfully. AI Analysis completed.',
        'report': report_record
    }), 200

@scan_bp.route('/scan_reports/<patient_id>', methods=['GET'])
def get_scan_reports(patient_id):
    reports = [r for r in SCAN_REPORTS_DB if r.get('patientId') == patient_id]
    return jsonify({'status': 'success', 'reports': reports}), 200
