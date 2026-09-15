#!/usr/bin/env bash

# PARKIA - Lógica del Backend de Login y Autenticación

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

echo "🔐 Iniciando endpoints de autenticación PARKIA..."

cd "$DIR/backend"

if [ ! -d "venv" ]; then
    echo "📦 Creando entorno virtual e instalando dependencias..."
    python3 -m venv venv
    venv/bin/pip install -r requirements.txt
fi

echo "🚀 Servidor corriendo en http://127.0.0.1:8000"
echo "👉 Endpoints de login y auth: http://127.0.0.1:8000/api/auth/"
echo ""

venv/bin/python manage.py runserver 127.0.0.1:8000
