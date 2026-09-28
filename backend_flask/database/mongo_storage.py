import os
from datetime import datetime

try:
    from pymongo import MongoClient
    PYMONGO_AVAILABLE = True
except ImportError:
    PYMONGO_AVAILABLE = False

class MongoStorage:
    _client = None
    _db = None

    @classmethod
    def get_db(cls):
        if not PYMONGO_AVAILABLE:
            return None

        if cls._db is None:
            mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/neuroguardian')
            try:
                cls._client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
                cls._client.admin.command('ping')
                db_name = mongo_uri.split('/')[-1].split('?')[0] or 'neuroguardian'
                cls._db = cls._client[db_name]
                print(f"[MongoDB] Successfully connected to {mongo_uri}")
            except Exception as e:
                print(f"[MongoDB Notice] Could not connect to MongoDB ({e}). Operating in persistent disk mode.")
                cls._db = None
        return cls._db

    # User Management
    @classmethod
    def save_user(cls, user_record):
        db = cls.get_db()
        if db is not None:
            try:
                db.users.update_one({'email': user_record['email']}, {'$set': user_record}, upsert=True)
                return True
            except Exception as e:
                print(f"[MongoDB Error] save_user: {e}")
        return False

    @classmethod
    def get_user(cls, email):
        db = cls.get_db()
        if db is not None:
            try:
                return db.users.find_one({'email': email}, {'_id': 0})
            except Exception as e:
                print(f"[MongoDB Error] get_user: {e}")
        return None

    @classmethod
    def get_all_users(cls):
        db = cls.get_db()
        if db is not None:
            try:
                return list(db.users.find({}, {'_id': 0}))
            except Exception as e:
                print(f"[MongoDB Error] get_all_users: {e}")
        return None

    # Patient Management
    @classmethod
    def save_patient(cls, patient_record):
        db = cls.get_db()
        if db is not None:
            try:
                db.patients.update_one({'id': patient_record['id']}, {'$set': patient_record}, upsert=True)
                return True
            except Exception as e:
                print(f"[MongoDB Error] save_patient: {e}")
        return False

    @classmethod
    def get_patients(cls, user_id=None, role='caregiver'):
        db = cls.get_db()
        if db is not None:
            try:
                if role == 'caregiver':
                    query = {'caregiverId': user_id}
                elif role == 'doctor':
                    query = {'$or': [{'assignedDoctorId': user_id}, {'assignedDoctorId': 'usr_doctor_default'}]}
                elif role == 'admin':
                    query = {}
                else:
                    query = {}
                return list(db.patients.find(query, {'_id': 0}))
            except Exception as e:
                print(f"[MongoDB Error] get_patients: {e}")
        return None

    # SOS Logs
    @classmethod
    def save_sos_log(cls, sos_record):
        db = cls.get_db()
        if db is not None:
            try:
                db.sos_logs.insert_one(dict(sos_record))
                return True
            except Exception as e:
                print(f"[MongoDB Error] save_sos_log: {e}")
        return False

    @classmethod
    def get_sos_logs(cls, patient_id=None):
        db = cls.get_db()
        if db is not None:
            try:
                query = {'patientId': patient_id} if patient_id else {}
                return list(db.sos_logs.find(query, {'_id': 0}).sort('timestamp', -1))
            except Exception as e:
                print(f"[MongoDB Error] get_sos_logs: {e}")
        return None
