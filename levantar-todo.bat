@echo off
REM Parkia - Levantar Backend y Frontend en Windows
title PARKIA - Startup Script

echo ==========================================
echo   Iniciando PARKIA en Windows...
echo ==========================================

cd /d "%~dp0backend"

REM Crear venv si no existe
if not exist "venv\" (
    echo Creando entorno virtual e instalando dependencias...
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate.bat
)

REM Migraciones y datos iniciales
echo Verificando base de datos y aplicando migraciones...
python manage.py migrate --noinput
python manage.py seed_db

REM Iniciar Backend en ventana separada
start "Parkia Backend (Django)" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate.bat && python manage.py runserver 127.0.0.1:8000"

REM Iniciar Frontend en ventana separada
start "Parkia Frontend (HTTP Server)" cmd /k "cd /d "%~dp0Parkia Front" && python -m http.server 8080"

echo.
echo ==========================================
echo   🚀 PARKIA esta ejecutandose!
echo   Frontend: http://localhost:8080
echo   Backend API: http://127.0.0.1:8000/api/
echo   Admin Django: http://127.0.0.1:8000/admin/
echo ==========================================
echo.
pause