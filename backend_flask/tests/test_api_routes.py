import unittest
import json
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import app

class FlaskApiTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_index(self):
        res = self.app.get('/')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['status'], 'ONLINE')

    def test_auth_signup_and_login(self):
        signup_res = self.app.post('/signup', json={
            'email': 'test@neuroguardian.com',
            'password': 'password123',
            'name': 'Test Caregiver'
        })
        self.assertEqual(signup_res.status_code, 201)

        login_res = self.app.post('/login', json={
            'email': 'test@neuroguardian.com',
            'password': 'password123'
        })
        self.assertEqual(login_res.status_code, 200)

    def test_patient_routes(self):
        res = self.app.get('/patient/pat_alz_9001')
        self.assertEqual(res.status_code, 200)

        qr_res = self.app.post('/generate_qr', json={'patientId': 'pat_alz_9001'})
        self.assertEqual(qr_res.status_code, 200)

    def test_medicine_routes(self):
        res = self.app.post('/set_medicine', json={
            'medicineName': 'Donepezil',
            'dosage': '10 mg',
            'timing': 'Morning'
        })
        self.assertEqual(res.status_code, 201)

    def test_mood_analysis(self):
        res = self.app.post('/analyze_mood', json={'text': 'Patient feels lost'})
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['detectedMood'], 'Confused')

    def test_ct_scan_upload(self):
        res = self.app.post('/upload_scan')
        self.assertEqual(res.status_code, 200)

    def test_emergency_sos(self):
        res = self.app.post('/send_sos', json={'patientId': 'pat_alz_9001'})
        self.assertEqual(res.status_code, 200)

if __name__ == '__main__':
    unittest.main()
