# LibreInmuebles — Plataforma P2P "Dueño Directo"

> Marketplace de bienes raíces en la modalidad **Dueño Directo** para Paso de los Libres, Corrientes.
> Conecta directamente a propietarios con interesados en alquilar o comprar, eliminando intermediarios y comisiones.

ROL: Arquitecto de Software Senior y Desarrollador Full Stack experto en Marketplace P2P y PropTech.

## 1. TECH STACK Y ARQUITECTURA

- **Frontend:** React (Vite, componentes funcionales, Hooks, Tailwind CSS responsivo, React Router).
- **Backend:** **Python + FastAPI** (arquitectura en capas: `api/` rutas, `services/` lógica de negocio, `repositories/` acceso a datos).
- **Base de Datos:** Relacional con SQLAlchemy ORM 2.0 — SQLite (dev) / PostgreSQL (prod) vía `DATABASE_URL`.
- **Migraciones:** Alembic desde el Paso 1.
- **Seguridad & Autenticación:** JWT, hashing de contraseñas con bcrypt, validación Pydantic, protección CORS, sanitización.
- **Configuración:** pydantic-settings + `.env` (ver `backend/.env.example`).

## 2. MODELO DE DIRECTORIO

```
Inmueble/
├── backend/
│   ├── app/            # core/ (config, db), models/, api/, services/, repositories/, schemas/
│   ├── alembic/        # migraciones
│   ├── tests/          # pytest
│   ├── requirements.txt
│   └── .env.example
├── frontend/           # React + Vite (Paso 4+)
└── docs/ER.md          # Diagrama Entidad-Relación
```

## 3. MODULOS DEL DOMINIO ("DUEÑO DIRECTO")

1. **Autenticación y Control Anti-Agencia** — roles Propietario/Buscador, declaración jurada de titular obligatoria en el registro, sistema comunitario de reportes.
2. **Gestión de Inmuebles (Wizard)** — operación (Alquiler Permanente/Temporal, Venta), tipo (Casa/Departamento/Terreno/Salón), datos de Paso de los Libres (barrio, precio ARS/USD, expensas, ambientes, `m²`, servicios), galería de imágenes, estado (Disponible/En Negociación/Finalizada).
3. **Motor de Búsqueda y Filtros** — tarjetas, filtros combinados (precio, operación, tipo, barrio, ambientes, servicios), vista detallada con mapa aproximado y contacto.
4. **Canal de Contacto Directo** — consultas internas (mensajes), botón de WhatsApp del propietario visible solo con usuario autenticado y habilidad del dueño.
5. **Herramientas Legales** — plantillas modelo descargables de contratos de alquiler vigentes (Argentina), orientativo entre particulares.

## 4. BUENAS PRÁCTICAS

- SOLID y Clean Architecture: BD desacoplada de controladores.
- Validación en ambos lados: Pydantic (backend) + tipos en formularios React.
- Excepciones centralizadas (`PropiedadNoEncontradaException`, `AccesoNoAutorizadoException`, toasts en UI).
- Consultas eficientes: `joinedload`/`selectinload` para evitar N+1.
- Tests: `pytest` por paso en backend.

## 5. PLAN DE EJECUCION PASO A PASO

> Ejecutar **un paso por vez** y detenerse al finalizar cada uno para pedir confirmación antes de continuar.

- [x] **Paso 1 — Arquitectura de BD y Modelos.** Diagrama E-R en `docs/ER.md`; modelos SQLAlchemy `User`, `Property`, `PropertyImage`, `Report`, `Inquiry` + enums; índices, FKs con CASCADE, `CheckConstraint`, Alembic con migración inicial; estructura backend/frontend, `.env.example`; tests `pytest` (6 verdes).
- [x] **Paso 2 — Backend Core (Auth y Middlewares).** Estructura FastAPI (`create_app`), bcrypt, emisión/validación JWT, `/auth/register`, `/auth/login` y `/auth/me`, excepciones centralizadas (`AppError` + handler), CORS configurable, `.env` con `SECRET_KEY` real. Tests: 16 verdes.
- [x] **Paso 3 — API REST de Propiedades y Búsqueda.** CRUD completo de propiedades (solo `role=propietario` para publicar; edición/borrado solo dueño), subida real de imágenes multipart (JPG/PNG/WebP ≤8MB → `backend/uploads/<id>/` con servir estático `/uploads`), filtros complejos (barrio, precio, operación, tipo, ambientes, servicios, moneda, sort, paginación), detalle con contacto oculto a anónimos y sin N+1 (`selectinload`/`joinedload`). Test: 31 verdes. Fixes de arranque: config resuelta contra `backend/` + `python backend/app/main.py` funcional desde la raíz.
- [x] **Paso 4 — Frontend React: Arquitectura, Estilos y Estado.** Vite + React + Tailwind v4 (plugin Vite) + React Router; `AuthContext` global (login/registro/logout, restauración de sesión al recargar), `AuthContext` + servicio API (`api/client.js` con token en localStorage y manejo de errores, `api/auth.js`, `api/properties.js`); proxy Vite `/auth|/properties|/uploads → :8000`; componentes base (Navbar, rutas protegidas, Spinner/Alert) y páginas (Home funcional con cards, Login/Registro funcionales, Detalle/Publicar esqueleto). Build OK. `package.json` raíz: `npm run dev` desde `Inmueble/`.
- [x] **Paso 5 — Frontend React: Componentes UI Principales.** `Home` con `FilterBar` (operación, tipo, barrio, precio min/max, dormitorios, servicios, orden y paginación) + cards; Wizard de publicación en 4 pasos con previsualización de fotos; vista detalle (galería con thumbnails, atributos, servicios, mapa OSM embed si hay lat/lng, contacto condicionado por autenticación, botón WhatsApp y email). Build OK; smoke integral vía proxy `:5173` (registro→crear→foto→filtros→detalle anónimo/auth→status→publicar como buscador 403).
- [x] **Paso 6 — Módulos de Contacto y Comunidad.** Endpoints `POST /inquiries` (consulta del interesado al dueño; bloqueadas sobre la propia publicación), `GET /inquiries/inbox|sent|unread-count` y `PATCH /inquiries/{id}/read` (solo el dueño); `POST /reports` (motivos, sin duplicados, bloqueada sobre publicación propia). Página `Mensajes` (pestañas Recibidos/Enviados, contacto del interesado + respuesta WhatsApp/email, paginación) con badge de no leídos en la Navbar (poll 30s); en el detalle, form "Preguntar al dueño" y modal "Reportar publicación" (solo autenticados y no dueños). Proxy Vite ampliado a `/inquiries|/reports`. Test: 43 verdes (12 nuevos). Smoke integral por proxy OK.
- [x] **Paso 7 — Herramientas Legales y Cierre.** Endpoints `GET /legal/templates` (3 plantillas: alquiler vivienda Ley 27.551, alquiler temporal, boleto de compraventa) y `GET /legal/templates/{slug}/download` (.doc editable, aplicación/msword, disclaimer orientativo); página `/legal` con descargas y aviso legal; link en Navbar y footer; proxy Vite `/legal/templates`. Pulido UX: títulos de pestaña dinámicos (hook `usePageTitle`). Revisión final: 49 tests backend verdes (+6 legales), build OK, smoke navegador (undici) de `/legal` completo + regresión registro. Cierre de deuda técnica: fix raíz `apiFetch` (body POJO → `JSON.stringify`) que rompía todas las mutaciones del navegador con 422 "JSON decode error".

## 5b. PLAN DE REFUERZO POST-7 (producción)

- [x] **Fase 0 — Corrección de bugs y hardening.** Auditoría read-only (backend + frontend); end-to-end completo con la API real:

  - *Backend*: guardia `SECRET_KEY` en prod (rechaza vacío/"change-me"/<32 chars); `is_staff` en `User`; reportes únicos `(reporter_id, property_id)` + índices (`ix_properties_created_at`, `ix_reports_reporter_id`, `uq_reports_reporter_property`; migración `b7f4210c9e5a`); schemas normalizados (`schemas/fields.py`: email lowercase+strip, Nombre/Precio/Título txt normales, `InquiryMessageStr`, password ≤72 bytes); `PropertyUpdate` rechaza nulls explícitos y whitespace; formularios y salidas con `strip`; `RateLimitError` 429 + handler catch-all 500 con logging; JWT algoritmo pinneado HS256; `PRAGMA foreign_keys=ON` (SQLite) + `pool_pre_ping`; staff auto-grant vía `STAFF_EMAILS`; declaración titular solo requerida para `role=propietario`; rate-limit en memoria (`RATE_LIMIT_ENABLED=true`) en register/login; subida de imágenes con validación de contenido real (Pillow: magic bytes + decodificación + extensión derivada del formato + tope de dimensiones `MAX_IMAGE_PIXELS_SIDE`); `bathrooms==0` incluye NULL como `bedrooms==0`; sort con tie-breaker `id.desc()`; borrado de archivos best-effort; consulta bloqueada sobre publicación `finalizada`; `InquiryOut` expone `recipient_email/recipient_phone/recipient_first_name/recipient_last_name`; docs de la API off en prod; `requirements.txt` con Pillow y `psycopg[binary]` (prod: `DATABASE_URL=postgresql+psycopg://`). Un bug real encontrado y arreglado por el smoke: Pillow lanza `SyntaxError` ante PNG con checksum corrupto y se escapaba al handler 500 → ahora 400.

  - *Frontend*: fix crítico TDZ en `PropertyDetail.jsx` (hook `usePageTitle` referenciaba `property` antes de su `useState` → pantalla blanca en detalle); `Messages.jsx` (WhatsApp `wa.me/...?...` con el `?` que faltaba, `mailto:` de la pestaña Enviados apuntaba a `undefined` → `recipient_email`, nombre del destinatario, guardia de carreras con secuencia); sesión coordinada: `apiFetch` emite evento `auth:unauthorized` en 401 y `AuthContext` solo limpia sesión en 401 (no ante errores transitorios); filtro de moneda real (nunca se enviaba `currency` — mezclaba ARS/USD en el feed); `Publish.jsx` (validación JPG/PNG/WebP ≤8MB antes de subir, max 6 fotos, rollback `DELETE /properties/{id}` si falla la subida, `URL.createObjectURL` memoizado con `revokeObjectURL` al desmontar); badge de estado en `PropertyCard`; helper compartido `lib/whatsapp.js` (E.164); `Register.jsx` (maxLength 100/30 + trim en payload); `PublicOnly` respeta el loading; `ErrorBoundary` global en `main.jsx`; SEO/OG + `favicon.svg` + theme-color en `index.html`; soporte `VITE_API_URL` + `assetUrl()` en `client.js`.

  - *Verificación*: 62 tests backend verdes (+13 regresiones), `npm run build` OK, smoke integral por proxy `:5173` — **31/31 checks** (registro owner/buscador, auth/me, crear propiedad, subir foto PNG real, foto servida por proxy, detalle con/sin contacto, feed, filtro ARS/USD, consulta → inbox/sent con recipient, reporte + duplicado 409, 401, marcar leído, /legal, email normalizado, password >72 bytes → 422). BD limpia con migraciones al día.

- [x] **Fase 1 — Moderación.** Backend: `get_current_staff` (no-staff → 403, anónimo → 401); `GET /moderation/reports` (filtro por estado + paginación, `ReportAdminOut` con título/barrio/owner/reportero) y `PATCH /moderation/reports/{id}/status` (solo staff); staff puede cambiar el estado de una propiedad vía `PATCH /properties/{id}/status`; `GET /properties/mine` (solo propias, orden decreciente, con imágenes) para la futura página "Mis publicaciones"; `python -m app.scripts.make_staff EMAIL`. Frontend: página `/moderacion` (tabs Todos/Pendientes/Revisados/Rechazados, motivo con labels, reportero y fecha, acciones "Marcar revisado"/"Rechazar reporte"/"Finalizar publicación", link al detalle, paginación), ruta protegida por `RequireStaff`, link "Moderar" en Navbar (desktop + móvil), proxy Vite `/moderation`. Verificación: **69 tests verdes** (+7 moderación), `npm run build` OK, smoke 18/18 (make_staff, cola pendiente con datos enriquecidos, 403/401, cambio de estado, filtros, finalizar publicación por staff vs 403 no-staff, `/properties/mine`, 404 y 422). BD limpia con migraciones al día.

- [x] **Fase 2 — Mis publicaciones + edición.** Backend ya contaba con el CRUD completo de propiedades de un dueño (reutilizado sin cambios): `GET /properties/mine`, `PUT /properties/{id}`, `DELETE /properties/{id}`, `PATCH /properties/{id}/status`, `POST /properties/{id}/images`, `PUT /properties/{id}/images/{image_id}/primary`, `DELETE /properties/{id}/images/{image_id}` — todos con autorización de dueño (403 si no). Frontend: página `/mis-publicaciones` (tarjetas con foto principal, badges de estado con `STATUS_LABELS`, precio formateado, selector de estado `disponible/en_negociacion/finalizada`, acciones Ver/Editar/Eliminar con confirmación, vacío con CTA a `/publicar`); página `/mis-publicaciones/:id/editar` con formulario prefilled (operación, tipo, título, descripción, barrio, dirección, precio+moneda, expensas, superficie, dormitorios/baños, lat/lng, servicios, WhatsApp de contacto y `allow_whatsapp` desde `contact`) y gestor de galería (subir validado JPG/PNG/WebP ≤8MB, marcar principal con estrella, eliminar foto, badge "Principal"); rutas protegidas por `RequireOwner`; links "Mis publicaciones" en Navbar (desktop + móvil). Verificación: `npm run build` OK (51 módulos), smoke 19/19 (mine owner/seeker, PUT edición y 403 no-owner, subir 2 fotos + 403, set primary, eliminar foto con auto-promoción de la principal, cambio a finalizada excluida del feed pero presente en `/mine`, DELETE y 404 posterior). BD limpia con migraciones al día.

- [x] **Fase 3 — Notificaciones por email + reset de contraseña.** Backend: `app/services/email_service.py` (best-effort que nunca rompe la API; consola `[EMAIL DEV]` sin SMTP, SMTP real con `smtp_host/port/user/password/from/tls` en prod); JWT con claims `typ` ("access" vs "password_reset") y `pf` (huella del hash de contraseña → cambiar la contraseña invalida todas las sesiones viejas); `POST /auth/forgot-password` (con rate-limit, idéntica respuesta para emails existentes/inexistentes — anti-enumeración) y `POST /auth/reset-password` (token de 15 min, rechaza tipo cruzado y tokens basura con 400, valida contraseña ≤72 bytes); el `AuthService` reusa `frontend_url` para armar el link `{frontend}/restablecer-clave?token=...`; notificación por email al dueño en cada consulta (mensaje del interesado + link a `/mensajes`); versión 0.8.0. Frontend: páginas `/recuperar-clave` (`ForgotPassword`) y `/restablecer-clave` (`ResetPassword` con validación de coincidencia y mínimo 8), link "¿Olvidaste tu contraseña?" en Login + aviso verde de éxito tras reset, `api/auth.js` con `forgotPassword`/`resetPassword`. Verificación: **74 tests verdes** (+5 reset), `npm run build` OK, smoke 16/16 (flujo completo reset: token firmado con SECRET_KEY real, login nuevo OK + viejo 401, sesión anterior 401, tokens cruzados 400/401, basura 400; emails de reset y de consulta impresos en consola dev al destinatario correcto). BD limpia con migraciones al día.

- [x] **Fase 4 — Tests Vitest + revisión final.** Tooling: `vitest` (v5) + `happy-dom` + `@testing-library/react` + `@testing-library/jest-dom`; `npm test` (`vitest run`); config en `vite.config.js` (environment happy-dom, globals, setup `src/test/setup.js`). **32 tests frontend verdes** en 4 archivos: `lib/whatsapp.test.js` (E.164, URL con texto url-encoded, null), `constants.test.js` (formatPrice ARS/USD es-AR, formatDateTime, catálogos consistentes operación/tipo, estados completos, motivos únicos), `api/client.test.js` (JSON.stringify, FormData intacto, 204→null, ApiError con detail string/lista de validación/status, 401 → limpia token + evento `auth:unauthorized`, no 401 no toca sesión), `components/Protected.test.jsx` (RequireAuth/PublicOnly/RequireOwner/RequireStaff con mock de `useAuth` y MemoryRouter: loading null, redirects, acceso concedido/bloqueado y pases por rol). `npm run build` OK con la config de Vitest.

- [x] **Fase 5 — Preparación para producción: stack 100% gratis (Render + Supabase + Vercel).** Backend: `backend/Procfile` (`alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}` — migraciones al arrancar en cada deploy); endpoint público `GET /health` para el health check de Render (+1 test); `backend/.env.example.prod` listo. Frontend: `frontend/vercel.json` con rewrite SPA → `index.html` para el router de React. Fix de producción: `database_url_resolved` traduce `postgresql://` → `postgresql+psycopg://` (esquema del pooler de Supabase/Neon). **79 tests backend verdes, 32 tests frontend verdes, `npm run build` OK.**

  - *Pasos de deploy (todo $0):*
    1. **Supabase** (o Neon) → crear proyecto gratuito → Database → Connection string: `postgresql://postgres.<ref>:<clave>@aws-0-<region>.pooler.supabase.com:6543/postgres` (la app la normaliza sola).
    2. **Render Free** → New → Web Service → apuntar repo/carpeta `backend/` → Build: `pip install -r requirements.txt` → Runtime: Python. Variables: copiar `backend/.env.example.prod` a `.env` del servicio (con `DATABASE_URL` de Supabase, `SECRET_KEY` generada ≥32 chars, `CORS_ORIGINS` y `FRONTEND_URL` del dominio de Vercel, `STAFF_EMAILS`, SMTP, `RATE_LIMIT_ENABLED=true`); health check path `/health`. El free plan duerme tras ~15 min sin tráfico (cold start tras el primer request).
    3. **Vercel** → New Project → carpeta `frontend/` → build `npm run build`, output `dist`; en Variables agregar `VITE_API_URL=https://<api>.onrender.com`. El `vercel.json` ya maneja el routing SPA.
    4. **Post-deploy:** crear el moderador con `python -m app.scripts.make_staff EMAIL` (en la consola de Render) o registrar el email en `STAFF_EMAILS` antes. Verificar `/health`, registro, publicación y un email de prueba.
  - *Limitaciones conocidas del stack gratis:*
    - **`/uploads` es efímero** en Render Free (sin disco persistente): las fotos se pierden al redeploy/descanso. Para durabilidad real: subir a **Cloudflare R2** (10 GB gratis, sin egress) con S3 — queda como mejora futura, o refrescar imágenes subiéndolas de nuevo.
    - **Cold start** del backend free (descanso tras ~15 min de inactividad).
    - **SQLite queda solo para dev**: en Render se usa Postgres de Supabase.

## 6. Como correr (desde la raíz `Inmueble/`)

- Terminal 1 — Backend: `python backend/app/main.py` (arranca en `http://127.0.0.1:8000`, API docs en `/docs`)
- Terminal 2 — Frontend: `npm run dev` (arranca en `http://localhost:5173`)
- Tests: `cd backend; .\.venv\Scripts\python -m pytest tests -q`
- Migraciones: `cd backend; .\.venv\Scripts\python -m alembic upgrade head`

## 7. Verificacion por paso

- Backend: `cd backend; .\.venv\Scripts\python -m pytest tests -q`
- Migraciones: `cd backend; .\.venv\Scripts\python -m alembic upgrade head`
- Server (Paso 2+): `cd backend; .\.venv\Scripts\python -m uvicorn app.main:app --reload`