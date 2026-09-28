from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from services.firebase_admin_service import FirebaseAdminService
from services.ai_scan_service import AiScanService

from routes.auth_routes import auth_bp
from routes.patient_routes import patient_bp
from routes.medicine_routes import medicine_bp
from routes.mood_routes import mood_bp
from routes.scan_routes import scan_bp
from routes.sos_routes import sos_bp
from routes.tracking_routes import tracking_bp
from routes.emergency_public_routes import emergency_public_bp

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for cross-origin frontend clients
CORS(app)

# Initialize Firebase Admin SDK
FirebaseAdminService.initialize(app.config['FIREBASE_CREDENTIALS_PATH'])

# Initialize and warm up the real Alzheimer's Disease AI Model
try:
    AiScanService.initialize()
except Exception as e:
    print(f"[Warning] Alzheimer AI Model initialization deferred: {e}")

# Register REST Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(patient_bp)
app.register_blueprint(medicine_bp)
app.register_blueprint(mood_bp)
app.register_blueprint(scan_bp)
app.register_blueprint(sos_bp)
app.register_blueprint(tracking_bp)
app.register_blueprint(emergency_public_bp)

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'system': 'NeuroGuardian - Production Alzheimer Health System REST API',
        'status': 'ONLINE',
        'version': '2.0.0'
    }), 200

import ssl
import threading
from werkzeug.serving import make_server
from services.ssl_cert_service import ensure_ssl_certificates, get_lan_ip

if __name__ == '__main__':
    lan_ip = get_lan_ip()
    https_port = 5001

    # Start HTTPS server for Android Mobile GPS sender (avoids browser secure-origin restrictions)
    try:
        cert_path, key_path = ensure_ssl_certificates()
        ssl_ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        ssl_ctx.load_cert_chain(cert_path, key_path)

        https_server = make_server('0.0.0.0', https_port, app, ssl_context=ssl_ctx, threaded=True)
        https_thread = threading.Thread(target=https_server.serve_forever, daemon=True)
        https_thread.start()
        print(f"[HTTPS Secure Origin] Android GPS Server running on https://{lan_ip}:{https_port}/android_gps")
    except Exception as ssl_err:
        print(f"[Warning] Could not start HTTPS listener: {ssl_err}")


    print(f"Starting NeuroGuardian Flask API Server on http://0.0.0.0:{Config.PORT}...")
    app.run(host='0.0.0.0', port=Config.PORT, debug=Config.DEBUG, use_reloader=False)

