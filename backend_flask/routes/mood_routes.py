from flask import Blueprint, request, jsonify
from datetime import datetime
from database.db_storage import DBStorage

mood_bp = Blueprint('mood', __name__)

# Persistent Mood Logs Store (Saved to disk: mood_logs.json)
MOOD_LOGS_DB = DBStorage.load("mood_logs.json", [])

def save_mood_logs():
    DBStorage.save("mood_logs.json", MOOD_LOGS_DB)

@mood_bp.route('/analyze_mood', methods=['POST'])
def analyze_mood():
    data = request.get_json() or {}
    raw_text = data.get('text', '').strip()
    text = raw_text.lower()
    patient_id = data.get('patientId', '')
    alzheimer_stage = data.get('alzheimerStage', 'Mild Cognitive Impairment')
    active_meds = data.get('activeMedicines', [])

    if not raw_text or not patient_id:
        return jsonify({'status': 'error', 'message': 'Observation text and Patient ID are required'}), 400

    emotion = "Neutral"
    confidence = 88.5

    if any(w in text for w in ["not well", "sick", "pain", "hurt", "unwell", "suffering", "bad", "terrible", "horrible"]):
        emotion = "Distress"
        confidence = 94.2
    elif any(w in text for w in ["lost", "where", "forget", "confus", "don't know", "which way", "who are you"]):
        emotion = "Confusion"
        confidence = 92.8
    elif any(w in text for w in ["sad", "crying", "depressed", "lonely", "miss", "hopeless", "grief"]):
        emotion = "Sadness"
        confidence = 91.0
    elif any(w in text for w in ["scared", "fear", "afraid", "terrified", "panic"]):
        emotion = "Fear"
        confidence = 93.5
    elif any(w in text for w in ["anxio", "worry", "nervous", "restless", "pacing", "uneasy"]):
        emotion = "Anxiety"
        confidence = 89.6
    elif any(w in text for w in ["angry", "shout", "frustrat", "stop", "leave me", "mad", "yelling"]):
        emotion = "Anger"
        confidence = 95.0
    elif any(w in text for w in ["stressed", "overwhelmed", "pressure", "tired", "exhausted"]):
        emotion = "Stress"
        confidence = 90.4
    elif any(w in text for w in ["happy", "joy", "smile", "laugh", "great", "wonderful", "enjoy"]):
        emotion = "Happiness"
        confidence = 96.1
    elif any(w in text for w in ["calm", "peace", "relaxed", "quiet", "content", "sleeping well"]):
        emotion = "Calm"
        confidence = 92.0

    suggestions = []
    actions = []

    if emotion == "Distress":
        suggestions.append("Patient expresses physical or mental discomfort. Perform immediate comfort check for hydration, pain, or temperature.")
        actions.append("Check vital signs and contact primary physician if distress persists.")
    elif emotion == "Confusion":
        suggestions.append(f"Patient is experiencing orientation difficulty typical of {alzheimer_stage}. Speak in short, reassuring sentences.")
        actions.append("Show familiar family photos or visual memory orientation cues.")
    elif emotion == "Sadness":
        suggestions.append("Offer emotional warmth, hold hands gently, or play acoustic music from their youth.")
        actions.append("Engage in a calm memory recall conversation about positive family events.")
    elif emotion == "Fear" or emotion == "Anxiety":
        suggestions.append("Reduce sensory overload, dim harsh lighting, and guide 3 slow deep breaths.")
        actions.append("Reassure patient of their physical safety and caregiver presence.")
    elif emotion == "Anger":
        suggestions.append("Maintain a non-confrontational stance and give safe personal space.")
        actions.append("Identify underlying frustration triggers (e.g. fatigue or noise) and remove them.")
    elif emotion == "Stress":
        suggestions.append("Provide a quiet relaxing environment and offer a warm herbal tea or water.")
        actions.append("Schedule a short calming walk in the safe zone area.")
    elif emotion == "Happiness" or emotion == "Calm":
        suggestions.append("Patient is in a positive emotional state. Excellent window for cognitive stimulation games.")
        actions.append("Engage in simple puzzle activities or storytelling.")
    else:
        suggestions.append("Patient emotional tone is balanced.")
        actions.append("Continue regular daily caregiving routine.")

    if active_meds:
        suggestions.append(f"Verify active medication compliance ({', '.join(active_meds[:2])}).")

    mood_record = {
        'id': f"mood_{int(datetime.now().timestamp() * 1000)}",
        'patientId': patient_id,
        'detectedMood': emotion,
        'confidenceScore': f"{confidence}%",
        'inputText': raw_text,
        'suggestion': " ".join(suggestions),
        'recommendedAction': " ".join(actions),
        'timestamp': datetime.now().isoformat()
    }

    MOOD_LOGS_DB.insert(0, mood_record)
    save_mood_logs() # Save directly to disk

    return jsonify({
        'status': 'success',
        'log': mood_record,
        'detectedMood': emotion,
        'confidenceScore': f"{confidence}%",
        'suggestion': mood_record['suggestion'],
        'recommendedAction': mood_record['recommendedAction']
    }), 200

@mood_bp.route('/mood_logs/<patient_id>', methods=['GET'])
def get_mood_logs(patient_id):
    logs = [m for m in MOOD_LOGS_DB if m.get('patientId') == patient_id]
    return jsonify({'status': 'success', 'logs': logs}), 200
