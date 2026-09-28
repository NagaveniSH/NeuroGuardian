import firebase_admin
from firebase_admin import credentials, firestore, auth

class FirebaseAdminService:
    _db = None
    _is_initialized = False

    @classmethod
    def initialize(cls, creds_path='firebase_creds.json'):
        if cls._is_initialized:
            return
        try:
            cred = credentials.Certificate(creds_path)
            firebase_admin.initialize_app(cred)
            cls._db = firestore.client()
            cls._is_initialized = True
            print("Firebase Admin SDK initialized successfully.")
        except Exception as e:
            print(f"Firebase Admin SDK initialization notice: running in fallback mode ({e})")
            cls._is_initialized = False

    @classmethod
    def get_db(cls):
        return cls._db
