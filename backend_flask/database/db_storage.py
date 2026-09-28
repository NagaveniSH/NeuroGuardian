import os
import json
import threading

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
os.makedirs(DATA_DIR, exist_ok=True)

_lock = threading.Lock()

class DBStorage:
    @staticmethod
    def load(filename, default_value):
        filepath = os.path.join(DATA_DIR, filename)
        with _lock:
            if os.path.exists(filepath):
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        return json.load(f)
                except Exception as e:
                    print(f"Error loading {filename}: {e}")
            return default_value

    @staticmethod
    def save(filename, data):
        filepath = os.path.join(DATA_DIR, filename)
        with _lock:
            try:
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
            except Exception as e:
                print(f"Error saving {filename}: {e}")
