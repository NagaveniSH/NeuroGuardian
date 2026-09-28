import os
import socket
import datetime
import ipaddress
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

def get_lan_ip():
    """Detects local LAN IPv4 address."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return '127.0.0.1'

def ensure_ssl_certificates(base_dir=None):
    """
    Generates a secure self-signed X.509 certificate with Subject Alternative Name (SAN)
    covering localhost, 127.0.0.1, and the local LAN IPv4 address for secure mobile GPS testing.
    """
    if base_dir is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    cert_path = os.path.join(base_dir, 'cert.pem')
    key_path = os.path.join(base_dir, 'key.pem')

    if os.path.exists(cert_path) and os.path.exists(key_path):
        return cert_path, key_path

    lan_ip = get_lan_ip()

    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, u'IN'),
        x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, u'Karnataka'),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, u'NeuroGuardian Health'),
        x509.NameAttribute(NameOID.COMMON_NAME, lan_ip),
    ])

    san_list = [
        x509.IPAddress(ipaddress.ip_address('127.0.0.1')),
        x509.DNSName(u'localhost'),
    ]
    try:
        san_list.append(x509.IPAddress(ipaddress.ip_address(lan_ip)))
    except Exception:
        pass

    cert = x509.CertificateBuilder().subject_name(
        subject
    ).issuer_name(
        issuer
    ).public_key(
        key.public_key()
    ).serial_number(
        x509.random_serial_number()
    ).not_valid_before(
        datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1)
    ).not_valid_after(
        datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=365)
    ).add_extension(
        x509.SubjectAlternativeName(san_list), critical=False
    ).sign(key, hashes.SHA256())

    with open(cert_path, 'wb') as f:
        f.write(cert.public_bytes(serialization.Encoding.PEM))

    with open(key_path, 'wb') as f:
        f.write(key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption()
        ))

    return cert_path, key_path
