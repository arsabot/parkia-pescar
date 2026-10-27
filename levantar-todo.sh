#!/usr/bin/env bash

# Parkia - Levantar Backend (Django) y Frontend (HTTP Server) en macOS / Linux
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

echo "🚗 Iniciando PARKIA..."

cd "$DIR/backend"

if [ ! -d "venv" ]; then
    echo "📦 Creando entorno virtual e instalando dependencias..."
    python3 -m venv venv
    venv/bin/pip install -r requirements.txt
fi

PYTHON_EXEC="$DIR/backend/venv/bin/python"

echo "🗄️ Verificando base de datos SQLite y aplicando migraciones..."
"$PYTHON_EXEC" "$DIR/backend/manage.py" migrate --noinput
"$PYTHON_EXEC" "$DIR/backend/manage.py" seed_db

# Iniciar Backend Django
echo "📦 Iniciando Backend Django (http://127.0.0.1:8000)..."
"$PYTHON_EXEC" "$DIR/backend/manage.py" runserver 127.0.0.1:8000 &
BACKEND_PID=$!

# Iniciar Frontend HTTP Server en puerto 8080
echo "🌐 Iniciando Frontend Parkia (http://localhost:8080)..."
cd "$DIR/Parkia Front"
python3 -m http.server 8080 &
FRONTEND_PID=$!

trap "echo ''; echo '🛑 Deteniendo servidores de PARKIA...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM EXIT

echo ""
echo "=========================================="
echo "  🚀 PARKIA está ejecutándose"
echo "  🌐 Frontend: http://localhost:8080"
echo "  🔌 Backend API: http://127.0.0.1:8000/api/"
echo "  🛠️ Admin Django: http://127.0.0.1:8000/admin/"
echo "  💳 Mercado Pago API: http://127.0.0.1:8000/api/pagos/"
echo "=========================================="
echo "Presiona Ctrl + C para detener ambos servidores."
echo ""

wait
