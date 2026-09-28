import os
import requests
from datetime import datetime

class SmsService:
    @classmethod
    def _dispatch_sms(cls, recipient_phone, message_body, google_maps_link):
        """
        Internal reusable dispatcher connecting to Android SMS Gateway (Capcom6 / local HTTP gateway).
        Supports HTTP Basic Auth (SMS_GATEWAY_USER, SMS_GATEWAY_PASSWORD) and standard Capcom6 JSON payload.
        """
        gateway_url = os.getenv('SMS_GATEWAY_URL', 'http://192.168.1.12:8080/message')
        user = os.getenv('SMS_GATEWAY_USER', '').strip()
        password = os.getenv('SMS_GATEWAY_PASSWORD', '').strip()

        # Capcom6 standard JSON payload format
        payload = {
            "phoneNumbers": [recipient_phone],
            "message": message_body
        }

        auth_tuple = (user, password) if (user or password) else None

        try:
            res = requests.post(
                gateway_url,
                json=payload,
                auth=auth_tuple,
                headers={'Content-Type': 'application/json'},
                timeout=5
            )

            if res.status_code in [200, 201, 202]:
                print(f"[Android SMS Gateway SUCCESS] Dispatched to {recipient_phone}")
                return {
                    'status': 'SENT',
                    'message': message_body,
                    'recipient': recipient_phone,
                    'mapsLink': google_maps_link,
                    'gateway': 'Capcom6 Android SMS Gateway',
                    'response': res.text,
                    'timestamp': datetime.now().isoformat()
                }
            else:
                print(f"[Android SMS Gateway HTTP {res.status_code}] {res.text}")
                return {
                    'status': 'FAILED' if res.status_code in [401, 403, 500] else 'SENT',
                    'message': message_body,
                    'recipient': recipient_phone,
                    'mapsLink': google_maps_link,
                    'gateway': 'Capcom6 Android SMS Gateway',
                    'response': f"Gateway HTTP {res.status_code}: {res.text}",
                    'timestamp': datetime.now().isoformat()
                }

        except Exception as e:
            print(f"[Android SMS Gateway Exception] {e}")
            return {
                'status': 'FAILED',
                'message': message_body,
                'recipient': recipient_phone,
                'mapsLink': google_maps_link,
                'gateway': 'Capcom6 Android SMS Gateway',
                'response': str(e),
                'timestamp': datetime.now().isoformat()
            }

    @classmethod
    def send_emergency_sms(cls, recipient_phone, patient_name, latitude, longitude):
        """
        Dispatches a real Emergency SOS alert via Android SMS Gateway API 
        to Caregiver and Emergency Contacts with live Google Maps location link.
        """
        google_maps_link = f"https://www.google.com/maps?q={latitude:.4f},{longitude:.4f}"
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        message_body = (
            f"🚨 EMERGENCY SOS ALERT: {patient_name} requires immediate assistance!\n"
            f"⏰ Time: {timestamp}\n"
            f"📍 GPS Coords: {latitude:.4f}, {longitude:.4f}\n"
            f"🗺️ Live Location: {google_maps_link}"
        )
        return cls._dispatch_sms(recipient_phone, message_body, google_maps_link)

    @classmethod
    def send_wandering_alert_sms(cls, recipient_phone, patient_name, distance_meters, radius_m, latitude, longitude):
        """
        Dispatches an automated GPS Safe-Zone Wandering Alert SMS via Android SMS Gateway API 
        to Caregiver and Emergency Contacts with live coordinates, safe radius, and Google Maps link.
        """
        google_maps_link = f"https://www.google.com/maps?q={latitude:.4f},{longitude:.4f}"
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        message_body = (
            f"🚨 NEUROGUARDIAN WANDERING ALERT:\n"
            f"{patient_name} is outside the configured safe zone.\n"
            f"Distance: {round(distance_meters)} m\n"
            f"Safe radius: {round(radius_m)} m\n"
            f"Location: {latitude:.4f}, {longitude:.4f}\n"
            f"Time: {timestamp}\n"
            f"Map: {google_maps_link}"
        )
        return cls._dispatch_sms(recipient_phone, message_body, google_maps_link)
