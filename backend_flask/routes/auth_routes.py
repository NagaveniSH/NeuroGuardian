from flask import Blueprint, request, jsonify
import json
import re
import base64
import hmac
import hashlib
from datetime import datetime
from config import Config
from database.db_storage import DBStorage
from database.mongo_storage import MongoStorage

auth_bp = Blueprint('auth', __name__)

# Persistent Users Store (Saved to disk: users.json)
USERS_DB = DBStorage.load("users.json", {})

def save_users():
    DBStorage.save("users.json", USERS_DB)

def validate_phone(phone_str):
    """Validates that a phone number contains exactly 10 numeric digits"""
    if not phone_str:
        return True
    cleaned = str(phone_str).strip()
    return bool(re.match(r'^\d{10}$', cleaned))

def generate_jwt_token(user_data):
    """Generates a secure HMAC-SHA256 JWT Token for Role-Based Auth"""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "uid": user_data['uid'],
        "email": user_data['email'],
        "role": user_data['role'],
        "exp": int(datetime.now().timestamp()) + 86400 # 24h expiration
    }
    
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    
    signature_input = f"{header_b64}.{payload_b64}".encode()
    signature = hmac.new(Config.SECRET_KEY.encode(), signature_input, hashlib.sha256).digest()
    signature_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    
    return f"{header_b64}.{payload_b64}.{signature_b64}"

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    name = data.get('name', '').strip()
    role = data.get('role', 'caregiver').lower()
    phone = data.get('phoneNumber', data.get('phone', '')).strip()

    if not email or not password or not name:
        return jsonify({'status': 'error', 'message': 'Email, password, and full name are required'}), 400

    if phone and not validate_phone(phone):
        return jsonify({'status': 'error', 'message': 'Phone number must contain exactly 10 digits.'}), 400

    if role not in ['caregiver', 'doctor', 'admin']:
        return jsonify({'status': 'error', 'message': 'Invalid role. Patient login is not permitted.'}), 400

    # Check MongoDB / USERS_DB existence
    mongo_user = MongoStorage.get_user(email)
    if email in USERS_DB or mongo_user:
        return jsonify({'status': 'error', 'message': 'User account already exists with this email address.'}), 400

    uid = f"usr_{role}_{int(datetime.now().timestamp() * 1000)}"
    user_record = {
        'uid': uid,
        'email': email,
        'displayName': name,
        'role': role,
        'phoneNumber': phone or '8095189197',
        'address': data.get('address', 'Springfield Health Zone'),
        'createdAt': datetime.now().isoformat()
    }
    
    user_with_pwd = {**user_record, 'password': password}
    USERS_DB[email] = user_with_pwd
    save_users()
    MongoStorage.save_user(user_with_pwd)

    token = generate_jwt_token(user_record)

    return jsonify({
        'status': 'success',
        'message': f'Registered successfully as {role.capitalize()}',
        'token': token,
        'user': user_record
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Strict Role-Based JWT Login:
    Only registered accounts can log in. Fallback auto-registration is strictly removed.
    """
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    role = data.get('role', 'caregiver').lower()

    if not email or not password:
        return jsonify({'status': 'error', 'message': 'Email and password are required'}), 400

    # Retrieve user from MongoDB or USERS_DB disk storage
    user_entry = USERS_DB.get(email) or MongoStorage.get_user(email)

    if not user_entry:
        return jsonify({
            'status': 'error',
            'message': 'Account does not exist with this email address. Please register first.'
        }), 401

    if user_entry.get('password') != password:
        return jsonify({
            'status': 'error',
            'message': 'Invalid password. Please check your login credentials.'
        }), 401

    user_profile = {
        'uid': user_entry['uid'],
        'email': user_entry['email'],
        'displayName': user_entry['displayName'],
        'role': user_entry['role'],
        'phoneNumber': user_entry.get('phoneNumber', '8095189197'),
        'address': user_entry.get('address', ''),
        'createdAt': user_entry['createdAt']
    }

    token = generate_jwt_token(user_profile)

    return jsonify({
        'status': 'success',
        'message': 'Logged in successfully',
        'token': token,
        'user': user_profile
    }), 200

@auth_bp.route('/forgot_password', methods=['POST'])
def forgot_password():
    """
    Forgot Password Endpoint:
    Allows registered users to reset their password securely.
    """
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    new_password = data.get('newPassword', '').strip()

    if not email or not new_password:
        return jsonify({'status': 'error', 'message': 'Email address and new password are required'}), 400

    user_entry = USERS_DB.get(email) or MongoStorage.get_user(email)

    if not user_entry:
        return jsonify({
            'status': 'error',
            'message': 'Account not found with this email address. Please verify your email or register.'
        }), 404

    user_entry['password'] = new_password
    USERS_DB[email] = user_entry
    save_users()
    MongoStorage.save_user(user_entry)

    return jsonify({
        'status': 'success',
        'message': 'Password reset successfully! You can now log in with your new password.'
    }), 200

@auth_bp.route('/doctors', methods=['GET'])
def get_doctors():
    doctors = [
        {
            'uid': u['uid'],
            'displayName': u['displayName'],
            'email': u['email'],
            'phoneNumber': u.get('phoneNumber', '8095189197')
        }
        for u in USERS_DB.values() if u.get('role') == 'doctor'
    ]
    if not doctors:
        doctors = [{
            'uid': 'usr_doctor_default',
            'displayName': 'Dr. Sarah Smith (Neurologist)',
            'email': 'dr.smith@neuroguardian.com',
            'phoneNumber': '8095189197'
        }]
    return jsonify({'status': 'success', 'doctors': doctors}), 200

@auth_bp.route('/user/profile', methods=['PUT', 'POST'])
def update_profile():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    phone = data.get('phoneNumber', '').strip()

    if phone and not validate_phone(phone):
        return jsonify({'status': 'error', 'message': 'Phone number must contain exactly 10 digits.'}), 400

    user_entry = USERS_DB.get(email)
    if not user_entry:
        return jsonify({'status': 'error', 'message': 'User profile not found'}), 404

    for field in ['displayName', 'phoneNumber', 'address']:
        if field in data:
            user_entry[field] = data[field]

    save_users()
    MongoStorage.save_user(user_entry)

    updated_profile = {
        'uid': user_entry['uid'],
        'email': user_entry['email'],
        'displayName': user_entry['displayName'],
        'role': user_entry['role'],
        'phoneNumber': user_entry.get('phoneNumber', '8095189197'),
        'address': user_entry.get('address', ''),
        'createdAt': user_entry['createdAt']
    }

    return jsonify({'status': 'success', 'user': updated_profile}), 200

@auth_bp.route('/admin/stats', methods=['GET'])
def get_admin_stats():
    """
    Admin Management Console API:
    Fetches full data of all registered caregivers, doctors, patients, and system metrics.
    """
    patients_db = DBStorage.load("patients.json", {})
    all_users = list(USERS_DB.values())

    caregivers = [u for u in all_users if u.get('role') == 'caregiver']
    doctors = [u for u in all_users if u.get('role') == 'doctor']
    patients = list(patients_db.values())

    return jsonify({
        'status': 'success',
        'stats': {
            'totalCaregivers': len(caregivers),
            'totalDoctors': len(doctors),
            'totalPatients': len(patients),
            'caregivers': caregivers,
            'doctors': doctors,
            'patients': patients
        }
    }), 200
