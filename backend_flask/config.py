import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'neuroguardian_super_secret_key_2026')
    FIREBASE_CREDENTIALS_PATH = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase_creds.json')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = os.getenv('DEBUG', 'True') == 'True'
    PORT = int(os.getenv('PORT', 5000))
    
    ALLOWED_ROLES = ["caregiver", "doctor", "admin"]
    
    ALZHEIMER_STAGES = [
        "Normal Cognition / No Impairment",
        "Very Mild Cognitive Decline",
        "Mild Cognitive Impairment (Early Stage)",
        "Moderate Alzheimer's (Middle Stage)",
        "Moderately Severe Alzheimer's",
        "Severe Alzheimer's (Late Stage)"
    ]
