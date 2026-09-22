# PARKIA - Lógica de Backend: Endpoints de Login y Autenticación

<div align="center">
  <img src="assets/preview.png" alt="Parkia Preview" width="100%" style="border-radius: 12px; margin: 16px 0; border: 1px solid rgba(255,255,255,0.1);" />
</div>

Este repositorio contiene exclusivamente la **lógica de backend y endpoints para el inicio de sesión y autenticación** de usuarios con tokens JWT.

---

## 📡 Endpoints de Autenticación (`/api/auth/`)

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/login/` | Iniciar sesión (valida credenciales y genera tokens JWT `access` y `refresh`) | No |
| `POST` | `/api/auth/register/` | Registro y validación de nuevos usuarios (rol Conductor o Administrador) | No |
| `POST` | `/api/auth/demo-login/` | Autenticación rápida para pruebas con perfiles demo (`driver` o `admin`) | No |
| `POST` | `/api/auth/token/refresh/` | Renovación del token de acceso expirado | No |
| `GET` | `/api/auth/me/` | Obtención de la información del usuario autenticado | Sí (Bearer) |
| `PATCH` | `/api/auth/me/` | Actualización de perfil del usuario autenticado | Sí (Bearer) |

---

## 📋 Lógica y Formatos de Solicitud

### 1. Inicio de Sesión (`POST /api/auth/login/`)
**Body:**
```json
{
  "email": "usuario@parkia.com",
  "password": "tu_password"
}
```

**Respuesta Exitosa (`200 OK`):**
```json
{
  "message": "Inicio de sesión exitoso.",
  "user": {
    "id": 1,
    "email": "usuario@parkia.com",
    "first_name": "Nombre",
    "last_name": "Apellido",
    "full_name": "Nombre Apellido",
    "role": "driver",
    "phone": "+54 9 11 5555-0100",
    "avatar_url": null,
    "created_at": "2026-09-15T09:00:00"
  },
  "tokens": {
    "refresh": "eyJhbGciOi...",
    "access": "eyJhbGciOi..."
  }
}
```

---

## 📁 Estructura del Código
```
parkia/
├── backend/
│   ├── apps/
│   │   └── users/
│   │       ├── models.py        # Modelo y manager de Usuario
│   │       ├── serializers.py   # Lógica de validación de credenciales y datos
│   │       ├── views.py         # Controladores de los endpoints de login/auth
│   │       ├── urls.py          # Enrutamiento de las rutas de auth
│   │       ├── permissions.py   # Lógica de roles y permisos
│   │       └── test_users.py    # Suite de pruebas unitarias de login
│   ├── config/
│   │   ├── settings.py          # Configuración de JWT, CORS y REST Framework
│   │   ├── urls.py              # Router principal (/api/auth/)
│   │   └── wsgi.py / asgi.py
│   ├── manage.py
│   └── requirements.txt
├── start.sh
└── README.md
```
