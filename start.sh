#!/usr/bin/env bash

# PARKIA - Inicio del Backend Django

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

echo "🔐 Iniciando backend PARKIA..."

cd "$DIR/backend"

if [ ! -d "venv" ]; then
    echo "📦 Creando entorno virtual e instalando dependencias..."
    python3 -m venv venv
    venv/bin/pip install -r requirements.txt
fi

echo "🗄️ Verificando migraciones y base de datos..."
venv/bin/python manage.py migrate --noinput
venv/bin/python manage.py seed_db

echo ""
echo "🚀 Backend corriendo en http://127.0.0.1:8000"
echo "👉 Endpoints API: http://127.0.0.1:8000/api/"
echo "👉 Panel Admin:   http://127.0.0.1:8000/admin/"
echo ""

venv/bin/python manage.py runserver 127.0.0.1:8000
