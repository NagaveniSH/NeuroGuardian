import subprocess
import time
import os
import sys
import shutil

def run_project():
    print("=" * 65)
    print(" NeuroGuardian: Launching Full System (Flask API + React Web)")
    print("=" * 65)

    project_root = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(project_root, "backend_flask")
    frontend_dir = os.path.join(project_root, "frontend_react")

    # Step 1: Launch Python Flask REST API Server
    print("\n[1/2] Starting Python Flask REST API Server on http://127.0.0.1:5000 ...")
    flask_process = subprocess.Popen(
        [sys.executable, "app.py"],
        cwd=backend_dir
    )
    
    time.sleep(2)

    # Step 2: Check Node / npm & Launch React Dev Server
    npm_cmd = shutil.which("npm") or shutil.which("npm.cmd")
    if not npm_cmd:
        print("\n [NOTICE] npm command not found in PATH.")
        print(" Python Flask REST API Server is running on http://127.0.0.1:5000")
        try:
            flask_process.wait()
        except KeyboardInterrupt:
            flask_process.terminate()
        return

    print(f"\n[2/2] Launching Vite React Application on http://localhost:3000 ...")

    try:
        npm_shell_cmd = "npm.cmd" if os.name == 'nt' else "npm"
        react_process = subprocess.Popen(
            [npm_shell_cmd, "run", "dev"],
            cwd=frontend_dir
        )
        react_process.wait()
    except KeyboardInterrupt:
        print("\nStopping NeuroGuardian System...")
    finally:
        print("Terminating Flask Server process...")
        flask_process.terminate()

if __name__ == "__main__":
    run_project()
