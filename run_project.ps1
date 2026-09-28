# NeuroGuardian Single Command Execution Script (PowerShell)
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  NeuroGuardian: Launching Full System (Flask + Flutter)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Flask Backend in new process
Write-Host "[1/2] Starting Python Flask REST Server on http://127.0.0.1:5000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ScriptDir\backend_flask'; python app.py"

Start-Sleep -Seconds 2

# Start Flutter Frontend in current process
Write-Host "[2/2] Launching Flutter Application ..." -ForegroundColor Green
Set-Location "$ScriptDir\frontend_flutter"
flutter run
