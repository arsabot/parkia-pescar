#!/usr/bin/env bash

# Parkia - Levantar Backend (Django) y Frontend (HTTP Server) en macOS / Linux
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

echo "🚗 Iniciando PARKIA..."

# Iniciar Backend Django
echo "📦 Iniciando Backend Django (http://127.0.0.1:8000)..."
if [ -f "$DIR/backend/venv/bin/python" ]; then
    PYTHON_EXEC="$DIR/backend/venv/bin/python"
else
    PYTHON_EXEC="python3"
fi

"$PYTHON_EXEC" "$DIR/backend/manage.py" runserver 127.0.0.1:8000 &
BACKEND_PID=$!

# Iniciar Frontend HTTP Server en puerto 8080
echo "🌐 Iniciando Frontend Parkia (http://localhost:8080)..."
cd "$DIR/Parkia Front"
python3 -m http.server 8080 &
FRONTEND_PID=$!

trap "echo 'Deteniendo servidores de PARKIA...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM EXIT

echo ""
echo "=========================================="
echo "  🚀 PARKIA está ejecutándose"
echo "  🌐 Frontend: http://localhost:8080"
echo "  🔌 Backend API: http://127.0.0.1:8000/api/"
echo "  💳 Mercado Pago API: http://127.0.0.1:8000/api/pagos/"
echo "=========================================="
echo "Presiona Ctrl + C para detener ambos servidores."
echo ""

wait
