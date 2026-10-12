@echo off
REM Parkia - Levanta backend (Django) y frontend (http.server) en dos ventanas.
REM No corre migraciones ni toca la base de datos.

REM Backend
start "Parkia Backend" cmd /k "cd /d "%~dp0backend" && venv\Scripts\activate.bat && python manage.py runserver"

REM Frontend
start "Parkia Frontend" cmd /k "cd /d "%~dp0Parkia Front" && python -m http.server 8080"

echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:8080
pause
