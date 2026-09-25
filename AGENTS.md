# AGENTS.md — LibreInmuebles

Guía operativa para agentes que trabajen en este repositorio. Toda la información fue verificada contra el código, los scripts y el estado de producción vigente.

> **Bitácora del proceso**: cada cambio o mejora relevante se documenta en `docs/PROCESO.md` (entrada con fecha + actualización de estado/decisiones). Mantenerla siempre al día antes de commitear.

## Visión general

Monorepo pequeño con dos aplicaciones independientes:

- `backend/` — API FastAPI + SQLAlchemy 2 + Alembic + pydantic-settings (Python 3.13.7, venv en `backend/.venv`).
- `frontend/` — React 19 + Vite 8 + Tailwind v4 (plugin de Vite) + Vitest.

Producción (stack 100 % gratis, desplegado y en funcionamiento): Render (API) + Supabase (Postgres vía pooler + Storage) + Vercel (SPA). El `push` a `main` dispara el auto-deploy de ambos.

Documentación de referencia: `plan.md` (historial de fases y decisiones), `docs/ER.md` (modelo de datos), `backend/.env.example.prod` (configuración de producción documentada).

## Comandos

Entorno Windows PowerShell 5.1: **no usar `&&`**; encadenar con `;` o `if ($?) { ... }`. Los comandos de Python deben ejecutarse **siempre desde `backend/`** (la carga de `backend/.env` y la resolución de rutas SQLite relativas dependen del directorio de trabajo).

```powershell
# Backend — servidor de desarrollo (uvicorn + reload en http://127.0.0.1:8000)
cd backend; .\.venv\Scripts\python main.py

# Frontend — dev desde la raíz (proxy Vite a :8000, UI en http://localhost:5173)
npm run dev

# Tests backend (suite completa ~91 tests, ~90s, SQLite en memoria)
cd backend; .\.venv\Scripts\python -m pytest tests -q

# Un archivo de tests puntual
cd backend; .\.venv\Scripts\python -m pytest tests/test_communication.py -q

# Tests frontend (Vitest) y build de producción
cd frontend; npm test
cd frontend; npm run build

# Migraciones (la URL sale de backend/.env vía app.core.config, no de alembic.ini)
cd backend; .\.venv\Scripts\python -m alembic upgrade head

# Smoke contra producción (necesita UTF-8 para la salida en consola de Windows)
$env:PYTHONUTF8="1"; $env:SMOKE_API_URL="https://libreinmuebles-api.onrender.com"; `
  .\.venv\Scripts\python -m app.scripts.smoke_prod
```

**Verificación mínima antes de cada commit/push**: `pytest` (backend) → `npm test` (frontend) → `npm run build`.

## Operación y despliegue (gotchas)

- `backend/.env` está en `.gitignore`. Plantillas: `.env.example` (desarrollo) y `.env.example.prod` (producción). En producción `SECRET_KEY` debe tener ≥32 caracteres; `config.py` lanza `ValueError` si no.
- **Base de datos de producción**: usar siempre el **session pooler** de Supabase (`aws-0-<region>.pooler.supabase.com:5432`). El host directo `db.<ref>.supabase.co` es **IPv6-only e inalcanzable desde Render** (`config.py` lo detecta y lo advierte en el log). La app normaliza sola `postgresql://` → `postgresql+psycopg://`.
- Cada deploy ejecuta `alembic upgrade head` automáticamente al arrancar. **Nunca crear o modificar tablas manualmente en la base de producción**; los cambios van por migraciones.
- **Fotos**: en producción se almacenan en Supabase Storage (bucket público `properties`, configurado con `SUPABASE_PROJECT_URL` + `SUPABASE_SERVICE_ROLE_KEY`; bootstrap inicial con `python -m app.scripts.setup_storage_bucket`). Sin esas variables, `storage_service.py` cae silenciosamente al filesystem local `/uploads`, que en Render es **efímero** (se pierde al redeploy). Desarrollo y tests no requieren configuración de storage.
- **Cold start de Render Free**: la instancia duerme tras ~15 min sin tráfico y la primera solicitud tarda 40-60 s. **No es un bug de código.** Un monitor UptimeRobot pingea `/health` cada 5 min para mantenerla activa; verificar el estado *warm* antes de reportar lentitud.
- La consola de Windows usa cp1252: los scripts con emojis/Unicode (p. ej. `smoke_prod.py`) fallan con `UnicodeEncodeError` si no se define `PYTHONUTF8=1`.

## Arquitectura y convenciones

- **Backend** (`backend/app/`): `api/routes/` (endpoints) → `services/` (lógica) → `repositories/` (consultas) → `models/` (SQLAlchemy); `schemas/` (Pydantic); `scripts/` (utilidades de una sola vez: `make_staff`, `setup_storage_bucket`, `smoke_prod`); `core/` (config, database, security).
- **Autenticación**: JWT en `core/security.py`; dependencias de rol en `api/deps.py` (403 si está autenticado sin el rol requerido, 401 si es anónimo). Otorgar rol de staff con `python -m app.scripts.make_staff <email>`.
- **SQLAlchemy**: al agregar relaciones que consuman endpoints de listado, cargarlas con `selectinload` definido en opciones del repositorio por entidad (ver `_REPLIES_OPTION` en `inquiry_repository.py`). Mezclar estrategias de carga por consulta rompe con el error "Loader strategies conflict".
- **Catálogos duplicados**: los enums viven en `models/enums.py` (backend) y su réplica en `src/constants.js` (frontend). Cualquier cambio de catálogo debe actualizar ambos.
- **Frontend, capa API** (`src/api/`): `client.js` expone `apiFetch` (token en `localStorage`, timeout 40 s vía `AbortController`, 401 → cierre de sesión + evento `auth:unauthorized`) y `assetUrl()` para imágenes; el resto son wrappers por dominio (auth, properties, comms, moderation, legal).
- **Mensajes en vivo**: la página `/mensajes` refresca con polling silencioso cada 10 s que **no** cierra el hilo abierto ni borra borradores. No sustituirlo por recargas completas de la lista.
- **Tests**: backend usa la fixture `db_session` (SQLite en memoria) de `tests/conftest.py`; nunca correr los tests contra producción. Frontend coloca `*.test.js(x)` junto al fuente; la configuración de Vitest está en `vite.config.js` (happy-dom, setup en `src/test/setup.js`).
- **Estilo**: commits convencionales (`feat:`, `fix:`, `chore:`, `docs:`); textos de UI en español; dependencias con versiones fijadas exactas en `requirements*.txt`.