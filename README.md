# LibreInmuebles — Plataforma P2P "Dueño Directo"

Marketplace de bienes raíces en la modalidad **Dueño Directo** para Paso de los Libres, Corrientes (Argentina). Conecta directamente a **propietarios** con **interesados** en alquilar o comprar, sin intermediarios ni comisiones.

- **Web publicada**: <https://libres-inmuebles.vercel.app>
- **API en producción**: <https://libreinmuebles-api.onrender.com>
- **Estado**: 91 tests backend + 34 tests frontend en verde, build OK, desplegado en stack 100 % gratis (Render + Supabase + Vercel).

---

## 1. Cómo funciona

| Módulo | Descripción |
|---|---|
| **Buscar inmuebles** | Feed con tarjetas y filtros combinados: operación (alquiler permanente, alquiler temporal, venta), tipo (casa, departamento, terreno, salón comercial), barrio, precio con moneda ARS/USD, dormitorios, baños y servicios; orden por más reciente o precio y paginación. |
| **Ver detalle** | Galería de fotos, atributos, servicios, ubicación aproximada (mapa si se cargaron coordenadas) y panel de contacto fijo al hacer scroll: email, WhatsApp y consulta interna. |
| **Contacto directo** | Consultas internas entre interesado y dueño, con **chat de respuestas in-app** que se actualiza solo cada 10 s (experiencia en vivo sin recargar), además de email y WhatsApp del propietario (visible solo autenticado y si el dueño lo habilitó). |
| **Moderación comunitaria** | Cualquier usuario autenticado puede **reportar** una publicación (sin duplicados, sin auto-reporte); el staff revisa la cola y puede cambiar el estado de la publicación. |
| **Mis publicaciones** | CRUD completo del dueño: crear, editar, eliminar, cambiar estado (disponible / en negociación / finalizada) y gestionar la galería (subir fotos, marcar la principal). |
| **Cuentas y seguridad** | Registro con rol **propietario** o **buscador**, declaración jurada de titularidad obligatoria para publicar, JWT, recuperación de contraseña por email. |
| **Herramientas legales** | Tres plantillas de contrato descargables en formato editable (.doc): alquiler de vivienda (Ley 27.551), alquiler temporal y boleto de compraventa, con aviso de carácter orientativo. |

### Roles

| Rol | Qué puede hacer |
|---|---|
| **Buscador** (visita autenticada) | Ver inmuebles, consultar al dueño, responder en el chat, reportar publicaciones. |
| **Propietario** | Todo lo del buscador + publicar, gestionar sus inmuebles y consultas recibidas. |
| **Staff** (moderador) | Revisar y resolver reportes; cambiar el estado de cualquier publicación. |
| **Anónimo** | Ver el feed y el detalle sin datos de contacto (anti-scraping). |

---

## 2. Stack y arquitectura

Monorepo pequeño con dos aplicaciones independientes:

- **`backend/`** — API REST en **Python 3.13 + FastAPI**, SQLAlchemy 2 (ORM), Alembic (migraciones), pydantic-settings (configuración por `.env`), JWT + bcrypt, validación con Pydantic y Pillow (validación real de imágenes).
- **`frontend/`** — SPA en **React 19 + Vite 8**, Tailwind CSS v4 (plugin de Vite), React Router, tests con Vitest.

```
Inmueble/
├── backend/                    # API Python + FastAPI
│   ├── app/
│   │   ├── api/routes/         #   endpoints HTTP
│   │   ├── core/               #   config, database, security (JWT), excepciones
│   │   ├── models/             #   SQLAlchemy: User, Property, PropertyImage, Report, Inquiry, InquiryReply
│   │   ├── schemas/            #   Pydantic (entrada/salida, normalización y validación)
│   │   ├── services/           #   lógica de negocio (+ storage local/Supabase)
│   │   ├── repositories/       #   consultas a la base de datos
│   │   └── scripts/            #   utilidades: make_staff, setup_storage_bucket, smoke_prod
│   ├── alembic/                # migraciones de esquema
│   ├── tests/                  # pytest (91 tests, SQLite en memoria)
│   ├── requirements.txt
│   ├── .env.example            # config de desarrollo
│   └── .env.example.prod      # config de producción documentada
├── frontend/                   # SPA React + Vite
│   ├── src/
│   │   ├── pages/              # Home, Detalle, Publicar, Mensajes, Mis publicaciones, Moderación, Legal…
│   │   ├── components/         # Navbar, cards, filtros, rutas protegidas, feedback, error boundary
│   │   ├── api/                # cliente HTTP (token, timeout, 401) y wrappers por dominio
│   │   ├── context/            # AuthContext (sesión global)
│   │   ├── hooks/ lib/         # utilidades (título de pestaña, WhatsApp, constantes)
│   ├── vite.config.js          # Vitest + proxy API a :8000 en desarrollo
│   ├── vercel.json             # rewrite SPA para el router de React
│   └── package.json
├── docs/ER.md                  # modelo de datos (diagrama entidad-relación)
├── plan.md                     # historial de fases, decisiones y despliegue
├── AGENTS.md                   # guía operativa para agentes que trabajen en el repo
├── render.yaml                 # blueprint de despliegue (Render backend)
└── package.json                # wrapper npm para el frontend
```

### Backend: flujo en capas

```
api/routes (validación + respuestas)
        │
        ▼
services (lógica de negocio: reglas, notificaciones, storage)
        │
        ▼
repositories (consultas SQLAlchemy, carga selectinload)
        │
        ▼
models + base de datos (Postgres en prod / SQLite en dev y tests)
```

### Frontend: capa API

`src/api/client.js` centraliza las llamadas: token en `localStorage`, timeout de 40 s con `AbortController`, cierre de sesión automático ante 401 (evento `auth:unauthorized`) y `assetUrl()` para servir imágenes subidas. Los wrappers por dominio (`auth.js`, `properties.js`, `comms.js`, `moderation.js`, `legal.js`) se usan desde las páginas.

---

## 3. Modelo de datos

Seis tablas (detalle completo en `docs/ER.md`):

| Tabla | Propósito |
|---|---|
| **User** | Cuenta con rol (`propietario`/`buscador`), declaración jurada anti-agencia, contacto (email, teléfono, WhatsApp). |
| **Property** | Publicación: tipo, operación, estado, precio+moneda, barrio, superficie, ambientes, servicios, coordenadas y contacto del dueño. |
| **PropertyImage** | Galería de la publicación con foto principal. |
| **Report** | Reporte comunitario (motivo, estado `pendiente/revisado/rechazado`), único por usuario y publicación. |
| **Inquiry** | Consulta de un interesado al dueño (mensaje, leído/no leído). |
| **InquiryReply** | Respuestas dentro de una consulta: la base del chat in-app. |

Decisiones clave: servicios modelados como columnas booleanas (filtrado SQL simple), borrado en cascada (`ON DELETE CASCADE`), índice compuesto que cubre el filtro de búsqueda combinado y `CheckConstraint` a nivel de base para precios y títulos.

---

## 4. API REST

Documentación interactiva en desarrollo: `http://127.0.0.1:8000/docs` (desactivada en producción).

### Autenticación — `/auth`

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/auth/register` | Público |
| POST | `/auth/login` | Público (rate-limited) |
| GET | `/auth/me` | Autenticado |
| POST | `/auth/forgot-password` | Público (anti-enumeración) |
| POST | `/auth/reset-password` | Público (token de 15 min) |

### Propiedades — `/properties`

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/properties` | Público |
| GET | `/properties/mine` | Propietario |
| GET | `/properties/{id}` | Público (contacto solo autenticado) |
| POST | `/properties` | Propietario |
| PUT | `/properties/{id}` | Dueño |
| DELETE | `/properties/{id}` | Dueño |
| PATCH | `/properties/{id}/status` | Dueño o staff |
| POST | `/properties/{id}/images` | Dueño (multipart, JPG/PNG/WebP ≤ 8 MB) |
| PUT | `/properties/{id}/images/{image_id}/primary` | Dueño |
| DELETE | `/properties/{id}/images/{image_id}` | Dueño |

### Comunicación — `/inquiries`, `/reports`

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/inquiries` | Autenticado |
| GET | `/inquiries/inbox` | Dueño |
| GET | `/inquiries/sent` | Autenticado |
| GET | `/inquiries/unread-count` | Dueño |
| GET | `/inquiries/{id}` | Solo participantes |
| POST | `/inquiries/{id}/replies` | Solo participantes |
| PATCH | `/inquiries/{id}/read` | Dueño |
| POST | `/reports` | Autenticado |

### Moderación — `/moderation`

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/moderation/reports` | Staff |
| PATCH | `/moderation/reports/{id}/status` | Staff |

### Legales y salud

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/legal/templates` | Público |
| GET | `/legal/templates/{slug}/download` | Público (`.doc` editable) |
| GET | `/health` | Público (health check del hosting) |

---

## 5. Puesta en marcha local

**Requisitos**: Python 3.13 (venv en `backend/.venv`) y Node.js (Vite 8).

```powershell
# 1) Backend: entorno virtual + dependencias (incluye pytest/httpx para tests)
cd backend
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements-dev.txt

# 2) Configuración: copiar la plantilla de desarrollo
#    (backend/.env → .env). Editar SECRET_KEY si se desea.

# 3) Migraciones
.\.venv\Scripts\python -m alembic upgrade head

# 4) Servidor de desarrollo (uvicorn + reload en http://127.0.0.1:8000)
.\.venv\Scripts\python main.py
```

```powershell
# 5) Frontend: desde la raíz del repo, sirve en http://localhost:5173
#    (el proxy de Vite redirige la API al backend :8000)
npm run dev
```

> Los comandos de Python se ejecutan siempre desde `backend/`: pydantic-settings lee `backend/.env` y las rutas relativas de SQLite se resuelven contra esa carpeta.

---

## 6. Pruebas

| Suite | Comando | Cobertura |
|---|---|---|
| Backend | `cd backend; .\.venv\Scripts\python -m pytest tests -q` | 91 tests: auth, propiedades, imágenes, búsqueda/filtros, consultas + respuestas, reportes, moderación, legales, storage, reset de contraseña, configuración. |
| Frontend | `cd frontend; npm test` | 34 tests Vitest (client HTTP, catálogos/formateo, plantilla WhatsApp, rutas protegidas). |
| Build | `cd frontend; npm run build` | Compilación de producción en `dist/`. |
| Smoke prod | `PYTHONUTF8=1; ` `SMOKE_API_URL=https://libreinmuebles-api.onrender.com` `python -m app.scripts.smoke_prod` | Health, feed y detalle contra el backend publicado. |

Verificación mínima antes de cada commit: **pytest → vitest → build**.

---

## 7. Producción y despliegue

Stack 100 % gratis, operativo:

| Componente | Rol |
|---|---|
| **Render** (web service) | API FastAPI. En cada deploy ejecuta automáticamente `alembic upgrade head` y luego inicia uvicorn. |
| **Supabase** | Postgres (vía *session pooler* `postgresql://postgres.<ref>@aws-0-<region>.pooler.supabase.com:5432/postgres`) y Storage para las fotos (bucket público `properties`). |
| **Vercel** | SPA React servida desde `frontend/` (build `npm run build`, salida `dist`, rewrite SPA). |

**El `push` a `main` dispara el deploy automático de ambos.**

Notas operativas:

- **Migraciones**: corren solas al arrancar. Los cambios de esquema van siempre por migraciones Alembic; no tocar tablas a mano en la base de producción.
- **Fotos**: en producción se almacenan en Supabase Storage (durable). Sin la configuración `SUPABASE_PROJECT_URL`/`SUPABASE_SERVICE_ROLE_KEY` el sistema cae al filesystem local, que en Render es efímero. Bootstrap del bucket: `python -m app.scripts.setup_storage_bucket`.
- **Conectividad a Postgres**: usar siempre el *session pooler* (IPv4). El host directo `db.<ref>.supabase.co` es IPv6-only e inalcanzable desde Render; `config.py` lo detecta y lo advierte en el log.
- **Cold start**: el plan free de Render pone la instancia en reposo tras ~15 min sin tráfico; la primera solicitud tarda 40-60 s. Un monitor de UptimeRobot sobre `GET /health` (cada 5 min) la mantiene activa.
- **Moderadores**: otorgar rol de staff con `python -m app.scripts.make_staff <email>` (o declarando `STAFF_EMAILS`).

---

## 8. Documentación relacionada

- `AGENTS.md` — guía operativa para agentes/IA que trabajen en el repositorio (comandos y gotchas).
- `plan.md` — historial completo de fases, decisiones técnicas y despliegue.
- `docs/ER.md` — modelo de datos y decisiones de diseño.
- `backend/.env.example.prod` — configuración de producción comentada campo por campo.