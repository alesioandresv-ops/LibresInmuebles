# Proceso de desarrollo — LibreInmuebles

> Bitácora viva del proyecto "Dueño Directo" (Paso de los Libres, Corrientes).
> Documenta **todo** el proceso: decisiones, iteraciones, correcciones y mejoras, en orden cronológico.

---

## Cómo mantener este documento

Regla de oro: **cada cambio relevante en el código o en la dirección del proyecto se anota acá.**

1. Agregá una entrada nueva al final de **Bitácora del proceso** (con fecha y título).
2. Si algo cambia (tests, deploy, decisiones), actualizá **Estado actual** y/o **Decisiones**.
3. No se borra histórico: siempre se **agrega** (las correcciones se narran dentro de la entrada que corresponda).

La guía técnica de referencia (arquitectura, comandos, gotchas de deploy) vive en `AGENTS.md`; `plan.md` conserva el plan de fases original. Este documento es la **memoria del proceso**.

---

## Estado actual del proyecto

- **Producción**: API en `https://libreinmuebles-api.onrender.com` (Render Free) · SPA en `https://libres-inmuebles.vercel.app` (Vercel) · Postgres + Storage en Supabase.
- **Repo**: monorepo `backend/` (FastAPI + SQLAlchemy 2 + Alembic) y `frontend/` (React 19 + Vite + Tailwind v4 + Vitest). Rama `main`.
- **Último estado verificado** (25/09/2026): **91 tests backend verdes** · **38 tests frontend verdes** · `npm run build` OK.
- **Commits en curso (25/09/2026)**: el usuario **aprobó** el rediseño y pidió commits separados. `constants.js` fusiona el helper `operationPeriod` (rediseño) con el catálogo de barrios, así que el reparto pragmático es: (1) `feat: rediseño visual LibreInmuebles 2.0` (incluye catálogo + `NeighborhoodPicker`, que nacieron junto al rediseño), (2) `feat: SEO básico (robots, sitemap, JSON-LD)`, (3) `docs: bitácora, AGENTS y README`. Objetivo: cada commit **compila y pasa tests**.
- **Servidores de dev** (si están levantados): API en `http://localhost:8000`, frontend en `http://localhost:5173`. Recordar **Ctrl+F5** tras cambios estáticos (cache del navegador).

---

## Bitácora del proceso

### 1. Fundación del MVP (fases 1-7 de `plan.md`)

Construcción completa del MVP por pasos: arquitectura de BD y modelos → backend core (auth JWT, bcrypt) → API REST de propiedades y búsqueda → frontend React (arquitectura, estilos, estado) → componentes UI principales → módulos de contacto y comunidad (inquilinos/respuestas, reportes) → herramientas legales.

Cierre con **49 tests backend** y smoke de navegador completo por proxy Vite → :8000.

### 2. Refuerzo post-lanzamiento y push a producción (fases 0-6 de `plan.md`)

Hardening y despliegue del stack 100 % gratuito (Render + Supabase + Vercel):

- **Hardening**: `SECRET_KEY` ≥32 chars en prod, validación de imágenes real (Pillow), rate-limit, reportes únicos, normalización de schemas, fix de un bug real (PNG con checksum corrupto → 400 en vez de 500).
- **Moderación con roles staff** (`make_staff`), **Mis publicaciones + edición**, **emails + reset de contraseña**, **tests Vitest**.
- **Fotos durables en Supabase Storage** (el disco efímero de Render perdía las fotos), **chat de respuestas in-app** (tabla `inquiry_replies`), **UX de cold start** (timeout 40s + Reintentar), **smoke contra producción** (`app.scripts.smoke_prod`) y ping de UptimeRobot → `/health`.
- Últimos commits previos al rediseño: `acedc84`, `161026b`, `07bc042` (polling de mensajes en vivo cada 10 s).

### 3. Rediseño visual "LibreInmuebles 2.0" (septiembre 2026)

Iteración de UI completa sobre la Home y componentes clave. Se trabajó **sin commits** por decisión del usuario, iterando hasta que el resultado visual quedara a gusto. **Sin migraciones de código backend** en esta etapa (solo un catálogo, ver sesión E).

#### Sesión A — Tokens, tipografía y rearmado de la Home
- Paleta nueva **azul** en `index.css` (`brand-50…900`, `accent #16B8F5`, fondo `#F7F9FC`, `--shadow-card`/`--shadow-card-hover`, contenedor de 1240 px).
- Fuente **Inter** (400–800) en `index.html`, `theme-color #0b3157` y `favicon.svg` propio.
- Se instaló **`lucide-react` v1.48.0**. Ojo: esa versión **eliminó los iconos de marcas** (Instagram/Facebook/Twitter/X) → se resolvió con SVGs inline en el Footer.
- Componentes nuevos: `Hero`, `HeroSearch`, `BenefitsBar`, `CategoryGrid` (conteos reales por categoría), `CtaOwner`, `Footer`; rediseño de `PropertyCard` (badge de operación, ♡ local, precio con "/ mes|/ día", fila de iconos lucide) y `Navbar` **transparente sobre el hero** (blanca al hacer scroll / en otras rutas).
- Se borró el footer inline viejo del Home y se recompuso la Home: hero → beneficios → propiedades → categorías → CTA.
- El buscador del hero embebe `FilterBar` con prop `embedded` (renderiza `<div>` para no anidar `<form>`), y "Buscar" de la Navbar hace scroll suave a `#busqueda`.

#### Sesión B — Hero fotográfico real
- Fondo del hero: se reemplazó el placeholder (SVG) por la foto real **`FondoLibreInmueble.png`** (copiada de la raíz del repo a `frontend/public/images/`), referencia configurada en `config/images.js` (`HERO_IMAGE`).
- **Footer**: la ubicación quedó como **"Paso de los Libres, Corrientes, Argentina"** (era "Río Uruguay, Corrientes").
- Se eliminó `hero.svg` y se reinició el dev server de Vite.

#### Sesión C — Overlay del hero y fotos reales de categorías
- Overlay más **liviano** sobre el hero: `from-black/40 via-black/15 to-black/45` + sombras de texto para legibilidad.
- Fotografías reales para categorías (copiadas de la raíz a `frontend/public/images/`):
  - Casa → `casa.webp` · Deptos → `departamento.jpg` · Terrenos → `terreno.jpg` · Locales → `salon_comercial.jpg`
- `CATEGORY_IMAGES` actualizado; se borraron los SVG placeholder de categorías.

#### Sesión D — CTA con imagen de casa fusionada (la más iterada)
El objetivo: fondo de la tarjeta CTA con **gradiente azul + foto de casa real** visible a la derecha, sin línea de corte visible.

- Origen: `Fond.jpeg` (1599×1066) → convertido con Pillow (q85, method 6) a `cta-house-bg.webp` (1x, 323 KB) y `cta-house-bg-2x.webp` (2x, 743 KB).
- `CtaOwner.css` con `.cta-libre`: gradiente `90deg #0A1931 → #0E2F5F 48% → rgba(14,47,95,0.7) 60% → transparent 95%` + capa de `image-set` con `@supports`; `background-size: auto 140%`; `background-position: right center`; min-height 400/280 px (mobile/desktop); overlay 70 % en mobile; contenido en ~60 % desktop.
- **Lección clave (bug visual)**: un *fade*/degradé hacia el color del gradiente dejaba una **línea visible** entre la imagen y el fondo. La solución real fue que la imagen **ya traiga transparencia alfa verdadera**: se regeneró con RGBA (píxeles x<351 transparentes, rampa hasta x=1119, opacos después). Resultado: transición limpia.
- Se quitaron el degradé de Tailwind y el "watermark" Accede/Home del componente (el texto del CTA se mantuvo).

#### Sesión E — Catálogo real de barrios y selector en cascada
- El usuario aportó la **lista real de barrios** de Paso de los Libres. Se actualizó **en espejo**: `NEIGHBORHOODS` (frontend, `src/constants.js`, 38 ítems) y `SUGGESTED_NEIGHBORHOODS` (backend, `models/enums.py`, 39). El backend **no** valida contra la lista (solo longitud ≤100), por eso no hizo falta migración.
- **Decisiones del usuario**: incluir "255 Viviendas" y "132 Viviendas (Tablitas)"; la zona **Barrio 508** usa una **cascada**: al elegirla aparece un segundo select con "Barrio 508" / "Sector 300". No migrar datos (la BD de dev solo tenía "Centro").
- Se creó **`NeighborhoodPicker.jsx`**: dos `<select>` enlazados (lista completa + subopciones si el valor es padre de `NEIGHBORHOOD_SUBOPTIONS`), envuelto en un contenedor flex para compartir el ancho de la celda. API: `value`, `onChange`, `allowEmpty`, `emptyLabel`, `className`, `aria-label`s.
- Integrado en: `HeroSearch`, `FilterBar`, `Publish` y `EditProperty` (en los formularios, `onChange={(value) => set("neighborhood")({ target: { value } })}` porque el helper `set` espera un evento).
- **Tests**: `NeighborhoodPicker.test.jsx` con un `Harness` con `useState` (el componente es controlado). 38 tests frontend.

### 4. SEO básico (25/09/2026)

Objetivo: que Google encuentre e indexe el sitio (sin prerender ni dominio propio).

- **`frontend/public/robots.txt`**: permite el rastreo y apunta al sitemap.
- **`frontend/public/sitemap.xml`**: `/` (daily, 1.0) y `/legal` (monthly, 0.3).
- **`frontend/index.html`**: `canonical`, `og:url/site_name/locale/image` (usa `FondoLibreInmueble.png`), `twitter:card=summary_large_image` y bloque **JSON-LD `WebSite`**.
- **Por qué no aparecía en Google** (diagnóstico): SPA sin SSR + cold start de la API (Googlebot ve poca texto), sin sitemap/robots, dominio `.vercel.app` flamante sin Google Search Console ni backlinks, y factor tiempo.
- **Pendiente manual**: verificar el sitio en Google Search Console (prefijo de URL `https://libres-inmuebles.vercel.app`), enviar el sitemap y pedir indexación. Preciso acceso privilegiado para agregar el archivo/meta de verificación que genere GSC.
- **Verificación GSC (25/09/2026)**: meta `google-site-verification` insertado en `index.html` (commit `ba7ea60`) → **propiedad verificada** vía "Etiqueta HTML". Se intentó primero el método "Archivo HTML" pero falló porque el archivo `googleXXXXX.html` nunca se subió al repo — el meta tag es el método que funciona y queda permanente.

### 5. Exploración de monetización (sin desarrollar)

El usuario preguntó cómo generar ingresos **sin que el dueño pague más que a una inmobiliaria**. Se listaron modelos (destacados pagos, packs por tiempo, visa de contactos, suscripción Pro, servicios auxiliares flat, patrocinios locales, convenio municipal). **Decisión: por ahora solo ideas, no se implementa nada.** La base recomendada es "publicar gratis + destacar con tarifa plana".

### 6. SEO de contenido para keywords locales (25/09/2026)

Desplegados los 3 commits del rediseño+catálogo+SEO y verificada la propiedad en GSC (método Etiqueta HTML). Al pedir la indexación en GSC el usuario chocó con la **cuota diaria** ("Cuota superada") → Google indexa igual, solo más lento; se reintenta al día siguiente.

Para apuntar a búsquedas como "departamentos/alquileres en Paso de los Libres":
- `index.html`: title/description/OG reescritos con las keywords (p. ej. "Casas y departamentos en Paso de los Libres — Alquiler y venta, dueño directo").
- `Home.jsx`: bloque de texto SEO real bajo el CTA (qué encontrar, barrios mencionados, dueño directo sin comisiones).
- `PropertyDetail.jsx`: **JSON-LD `RealEstateListing`** por propiedad (precio, moneda, dirección, localidad/región, superficie, dormitorios/baños, imágenes, fecha), inyectado dinámico con limpieza al desmontar.

---

## Decisiones registradas

| Fecha | Decisión | Consecuencia |
| --- | --- | --- |
| Sep 2026 | **No commitear el rediseño hasta aprobación visual** | `git status` muestra el rediseño+SEO+catálogo como pendiente; se desharía si no quedara a gusto |
| Sep 2026 | Sin dominio propio por ahora | SEO básico sí; rankear "libres inmuebles" llevará meses y backlinks |
| Sep 2026 | Barrios: lista real + cascada "Barrio 508 → Barrio 508/Sector 300" | Catálogo se mantiene en espejo frontend/backend |
| Sep 2026 | No migrar datos de barrios | La BD no valida el catálogo; sin consulta de cambio |
| Sep 2026 | CTA: transparencia alfa real (no fade a color) | Imagen regenerada con RGBA de grado creciente |
| Sep 2026 | Monetización: solo brainstorm | No hay cambios de código |
| Sep 2026 | SEO: robots + sitemap + JSON-LD, sin prerender | Espera verificación manual en GSC |

---

## Pendientes

- [ ] Aprobación visual del rediseño → **commit** (incluye catálogo, SEO, `AGENTS.md`, `README.md` e imágenes).
- [ ] Verificar dominio en **Google Search Console** y pedir indexación (necesita el código que genera GSC).
- [ ] Si más adelante se monetiza: definir pasarela de pago y modelo de destacados.