@echo off
echo ============================================================
echo   NeuroGuardian: Launching Full System (Backend + Frontend)
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting Python Flask REST API Server on http://127.0.0.1:5000 ...
start "NeuroGuardian Flask Backend" cmd /k "cd backend_flask && python app.py"

timeout /t 2 /nobreak >nul

echo [2/2] Launching Flutter Application...
where flutter >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [NOTICE] Flutter command not found in PATH.
    echo Python Flask API Server is running in the background at http://127.0.0.1:5000
    echo Please run 'flutter run' inside 'frontend_flutter' folder.
    echo.
    pause
    exit /b
)

cd frontend_flutter
flutter run
