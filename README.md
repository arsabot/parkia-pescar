# 🚗 PARKIA - Plataforma Inteligente de Reserva de Estacionamientos

<div align="center">
  <img src="assets/preview.png" alt="Parkia Preview" width="100%" style="border-radius: 12px; margin: 16px 0; border: 1px solid rgba(255,255,255,0.1);" />
</div>

**PARKIA** es una solución integral para conductores y administradores de cocheras en la Ciudad Autónoma de Buenos Aires (CABA). Permite encontrar estacionamientos cercanos con disponibilidad en tiempo real mediante geolocalización GPS, comparar tarifas, reservar espacios con confirmación inmediata, pagar a través de **Mercado Pago** y acceder mediante código QR.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu computadora:

* **Python 3.10 o superior** (probado en 3.10, 3.11, 3.12 y 3.14).
* **Git** para clonar el repositorio.
* **Navegador web moderno** (Chrome, Firefox, Safari o Edge).

---

## ⚡ Opción 1: Inicio Rápido Automático (Recomendado)

El proyecto incluye scripts que se encargan automáticamente de crear el entorno virtual, instalar dependencias, migrar la base de datos, cargar los datos de prueba (`seed`) y levantar tanto el Backend como el Frontend.

### En macOS / Linux
Abre una terminal en la carpeta del proyecto y ejecuta:
```bash
chmod +x levantar-todo.sh
./levantar-todo.sh
```

### En Windows
Haz doble click sobre el archivo:
```cmd
levantar-todo.bat
```
*(O ejecútalo directamente desde la consola `cmd.exe`)*

Ambos servidores quedarán corriendo simultáneamente:
* **Frontend Web:** [http://localhost:8080](http://localhost:8080)
* **Backend Django API:** [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)

---

## 🛠️ Opción 2: Instalación y Puesta en Marcha Manual

Si prefieres realizar el paso a paso manual o necesitas levantar los servicios por separado, sigue estas instrucciones:

### 1. Clonar el repositorio
```bash
git clone https://github.com/arsabot/parkia-pescar.git
cd parkia
```

### 2. Configurar el Backend (Django)

Ingresa a la carpeta del backend:
```bash
cd backend
```

Crea y activa un entorno virtual de Python:
* **En macOS / Linux:**
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```
* **En Windows:**
  ```cmd
  python -m venv venv
  venv\Scripts\activate.bat
  ```

Instala las librerías necesarias:
```bash
pip install -r requirements.txt
```

---

### 3. Configurar y Migrar la Base de Datos

> [!NOTE]
> La base de datos utilizada es **SQLite local** (`backend/db.sqlite3`). No requiere instalar PostgreSQL, MySQL ni configurar servidores externos de bases de datos.

Aplica las migraciones estructurales de Django:
```bash
python manage.py migrate
```

---

### 4. Poblar la Base de Datos con Datos de Prueba (`seed_db`)

Para que la aplicación tenga cocheras reales, plazas disponibles, servicios y usuarios de prueba listos para interactuar, ejecuta el comando seed:
```bash
python manage.py seed_db
```

**¿Qué datos crea este comando automáticamente?**
* **5 Estacionamientos verificados en CABA:**
  1. *Estacionamiento Central Obelisco* (Av. Corrientes 1050)
  2. *Parking Plaza de Mayo* (Hipólito Yrigoyen 450)
  3. *Garage Puerto Madero Dique 3* (Juana Manso 1100 - Abierto 24hs)
  4. *Parkia Recoleta Mall* (Vicente López 2050)
  5. *Cocheras Palermo Soho* (Honduras 4800)
* **135 Plazas de estacionamiento** con distribución realista de espacios libres y reservados.
* **Planes B2B SaaS:** Plan Básico y Plan Premium Destacado.
* **Servicios / Amenidades:** Techado, Seguridad 24h, Mercado Pago, Carga eléctrica, Lavadero y Acceso con QR.
* **Usuarios de Prueba:** Cuentas demo preconfiguradas para Conductor y Administrador.

---

### 5. Iniciar el Servidor Backend (Django)

Con el entorno virtual activado, ejecuta:
```bash
python manage.py runserver 127.0.0.1:8000
```
El servidor backend quedará disponible en `http://127.0.0.1:8000/`.

---

### 6. Iniciar el Servidor Frontend

Abre **otra ventana de terminal**, colócate en la raíz del proyecto y entra a la carpeta del Frontend:
```bash
cd "Parkia Front"
python3 -m http.server 8080
```
*(En Windows puedes usar `python -m http.server 8080`)*

Abre tu navegador en:
👉 **[http://localhost:8080/index.html](http://localhost:8080/index.html)**

---

## 🔑 Credenciales y Cuentas Demo de Prueba

El sistema cuenta con usuarios ya creados por el comando `seed_db` para que el equipo pueda probar todos los roles sin registrarse manualmente:

| Rol | Correo Electrónico | Contraseña | Capacidades y Funciones |
| :--- | :--- | :--- | :--- |
| **Conductor (Driver)** | `conductor@parkia.com` | `password123` | Búsqueda por mapa/GPS, filtros por servicios, cálculo de distancia, reserva de cocheras, simulación de pago con Mercado Pago y visualización de QR de acceso. Cuenta con suscripción *Parkia Pass* activa. |
| **Administrador (B2B)** | `admin@parkia.com` | `password123` | Acceso al **Panel de Cocheras** (`vistas/dashboard_negocio.html`), control de tarifas, métricas de ocupación, gestión de planes destacados y acceso al **Admin de Django** (`/admin/`). |

> [!TIP]
> En la pantalla de inicio de sesión (`vistas/login.html`) también dispones de los botones de **"Demo Conductor"** y **"Demo Administrador"** para ingresar con un solo click.

---

## 🌐 URLs y Vistas Principales

| Servicio / Vista | URL Local | Descripción |
| :--- | :--- | :--- |
| 🏠 **Inicio (Hub + Mapa)** | `http://localhost:8080/index.html` | Pantalla principal: Hub de cocheras a la izquierda y mapa interactivo Leaflet a la derecha (en mobile: selector por pestañas y vista completa). |
| 🔍 **Buscador Avanzado** | `http://localhost:8080/vistas/buscador.html` | Buscador dedicado con filtros por precio, techado y horarios. |
| 📅 **Mis Reservas** | `http://localhost:8080/vistas/reservas.html` | Listado de reservas activas con código QR emergente. |
| 📊 **Panel Cocheras B2B** | `http://localhost:8080/vistas/dashboard_negocio.html` | Panel de control para administradores de estacionamientos. |
| 🔐 **Login / Registro** | `http://localhost:8080/vistas/login.html` | Autenticación de usuarios con tokens JWT. |
| 🔌 **API REST Estacionamientos** | `http://127.0.0.1:8000/api/estacionamientos/` | Endpoint JSON con disponibilidad, tarifas y amenidades. |
| 💳 **API Mercado Pago** | `http://127.0.0.1:8000/api/pagos/crear-preferencia/` | Creación de preferencias de pago con webhook y confirmación. |
| 🛠️ **Panel Admin Django** | `http://127.0.0.1:8000/admin/` | Panel administrativo nativo de Django. |

---

## 🧪 Ejecución de Tests Unitarios

El backend cuenta con una suite completa de pruebas unitarias automatizadas que validan modelos, serializadores, cálculos de distancia, disponibilidad y pasarela de pago.

Para ejecutar los tests:
```bash
cd backend
python manage.py test apps
```
**Resultado esperado:**
```text
Ran 20 tests in 7.8s

OK
```

---

## 📁 Estructura del Repositorio

```text
parkia/
├── backend/
│   ├── apps/
│   │   ├── users/               # Modelos de Usuario, Cocheras, Espacios, Servicios y Planes
│   │   │   ├── management/
│   │   │   │   └── commands/
│   │   │   │       └── seed_db.py # Script de poblado inicial de base de datos
│   │   │   ├── views.py         # Endpoints de autenticación JWT y login demo
│   │   │   └── serializers.py
│   │   ├── estacionamientos/    # API REST de búsqueda, filtros y reservas
│   │   └── pagos/               # Integración de pasarela Mercado Pago
│   ├── config/
│   │   ├── settings.py          # Configuración de base de datos, CORS y SimpleJWT
│   │   └── urls.py              # Rutas principales del backend
│   ├── manage.py
│   └── requirements.txt
├── Parkia Front/
│   ├── css/
│   │   ├── inicio.css           # Estilos del mapa, hub split y responsive
│   │   └── chatbot.css          # Estilos del asistente virtual ParkiaBot
│   ├── js/
│   │   └── chatbot.js           # Lógica del chatbot con preguntas frecuentes
│   ├── vistas/                  # Vistas HTML (reserva, buscador, dashboard, login)
│   └── index.html               # Página principal (Hub + Mapa)
├── assets/
├── levantar-todo.sh             # Script automático para macOS y Linux
├── levantar-todo.bat            # Script automático para Windows
├── start.sh                     # Script para levantar backend individual
└── README.md
```

---

## ❓ Solución de Problemas Frecuentes

### 1. "Address already in use" (Puerto 8000 u 8080 ocupado)
Si ya tienes otro proceso usando el puerto 8000 o el 8080:
* En macOS / Linux:
  ```bash
  # Ver qué proceso usa el puerto 8000
  lsof -ti :8000 | xargs kill -9
  # Ver qué proceso usa el puerto 8080
  lsof -ti :8080 | xargs kill -9
  ```
* En Windows:
  ```cmd
  netstat -ano | findstr :8000
  taskkill /PID <NUMERO_PID> /F
  ```

### 2. Error "No module named django"
Asegúrate de haber activado el entorno virtual (`source venv/bin/activate` o `venv\Scripts\activate.bat`) antes de ejecutar los comandos de Django.

### 3. Permiso denegado al ejecutar scripts `.sh` en Mac/Linux
Otorga permisos de ejecución con:
```bash
chmod +x levantar-todo.sh start.sh
```

---

### 👥 Equipo y Contribuciones
Proyecto desarrollado para el programa **Forge Champions / Pescar**. Si realizas cambios en modelos, recuerda generar las migraciones correspondientes con `python manage.py makemigrations`.
