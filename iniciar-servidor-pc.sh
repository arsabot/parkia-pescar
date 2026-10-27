#!/usr/bin/env bash

# Parkia - Iniciar tu PC como Servidor de Backend para Vercel
# Conecta Django (http://127.0.0.1:8000) a internet vía Cloudflare Tunnel (HTTPS)

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

echo "🚗 PARKIA - Servidor Remoto desde tu PC"
echo "=========================================="

cd "$DIR/backend"

if [ ! -d "venv" ]; then
    echo "📦 Creando entorno virtual e instalando dependencias..."
    python3 -m venv venv
    venv/bin/pip install -r requirements.txt
fi

PYTHON_EXEC="$DIR/backend/venv/bin/python"

echo "🗄️ Verificando base de datos y migraciones..."
"$PYTHON_EXEC" "$DIR/backend/manage.py" migrate --noinput
"$PYTHON_EXEC" "$DIR/backend/manage.py" seed_db

if [ -f "$DIR/backend/venv/bin/gunicorn" ]; then
    echo "📦 Iniciando Servidor WSGI Gunicorn (http://127.0.0.1:8000)..."
    cd "$DIR/backend"
    "$DIR/backend/venv/bin/gunicorn" config.wsgi:application --bind 127.0.0.1:8000 --workers 2 &
    BACKEND_PID=$!
else
    echo "📦 Iniciando Backend Django (http://127.0.0.1:8000)..."
    "$PYTHON_EXEC" "$DIR/backend/manage.py" runserver 127.0.0.1:8000 &
    BACKEND_PID=$!
fi

echo "🌐 Conectando túnel seguro Cloudflare (HTTPS)..."
cloudflared tunnel --url http://127.0.0.1:8000 &
TUNNEL_PID=$!

trap "echo ''; echo '🛑 Deteniendo servidor y túnel...'; kill $BACKEND_PID $TUNNEL_PID 2>/dev/null; exit 0" SIGINT SIGTERM EXIT

echo ""
echo "=========================================="
echo "  🚀 Tu PC está actuando como servidor para PARKIA"
echo "  🌐 Frontend desplegado en Vercel: https://parkia-lac.vercel.app"
echo "  🔌 Backend API local:             http://127.0.0.1:8000/api/"
echo "  🛠️ Admin Django:                   http://127.0.0.1:8000/admin/"
echo "=========================================="
echo "Presiona Ctrl + C para detener el servidor."
echo ""

wait
