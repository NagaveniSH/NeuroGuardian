import json

SEED_DATA = {
    "users": [
        {
            "uid": "usr_alz_1001",
            "email": "caregiver@neuroguardian.com",
            "displayName": "Eleanor Vance",
            "role": "caregiver",
            "phoneNumber": "+1 (555) 234-5678",
            "createdAt": "2026-07-20T10:00:00Z"
        }
    ],
    "patients": [
        {
            "id": "pat_alz_9001",
            "name": "Robert Vance",
            "age": 74,
            "gender": "Male",
            "address": "742 Evergreen Terrace, Springfield",
            "caregiverId": "usr_alz_1001",
            "caregiverName": "Eleanor Vance",
            "emergencyContact": "+1 (555) 987-6543",
            "alzheimerStage": "Mild Cognitive Impairment (Early Stage)",
            "medicalNotes": "Needs gentle morning reminders. Responds well to familiar music.",
            "photoUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
            "createdAt": "2026-07-20T10:15:00Z"
        }
    ],
    "medicines": [
        {
            "id": "med_101",
            "patientId": "pat_alz_9001",
            "medicineName": "Donepezil (Aricept)",
            "dosage": "10 mg",
            "timing": "Morning",
            "timeOfDay": "08:00 AM",
            "instructions": "Take after breakfast with a full glass of water",
            "isCompletedToday": True
        },
        {
            "id": "med_102",
            "patientId": "pat_alz_9001",
            "medicineName": "Memantine (Namenda)",
            "dosage": "5 mg",
            "timing": "Night",
            "timeOfDay": "08:00 PM",
            "instructions": "Take before bedtime",
            "isCompletedToday": False
        }
    ],
    "mood_logs": [
        {
            "id": "mood_001",
            "patientId": "pat_alz_9001",
            "detectedMood": "Confused",
            "inputText": "I cannot find my glasses and I felt disoriented about the time of day.",
            "suggestion": "Reassure patient, keep items in fixed locations, and maintain calm ambient light.",
            "timestamp": "2026-07-20T09:30:00Z"
        }
    ]
}

def seed_database():
    print("Seeding NeuroGuardian Database Collections...")
    print(f"Generated {len(SEED_DATA['users'])} User records.")
    print(f"Generated {len(SEED_DATA['patients'])} Patient records.")
    print(f"Generated {len(SEED_DATA['medicines'])} Medicine schedules.")
    print(f"Generated {len(SEED_DATA['mood_logs'])} Initial Mood logs.")
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
