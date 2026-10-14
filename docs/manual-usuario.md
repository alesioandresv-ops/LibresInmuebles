# Manual de Usuario - LibreInmuebles

LibreInmuebles es una plataforma para publicar y buscar inmuebles directo entre propietarios e interesados, sin intermediarios. 

## 1. ¿Qué es LibreInmuebles?

LibreInmuebles conecta **dueños directos** con **personas que buscan alquilar o comprar**. 

- **Sin intermediarios**: las consultas van directo al propietario.
- **Gratuito**: crear cuenta, buscar y contactar no tiene costo.
- **Enfocado a Paso de los Libres, Corrientes (Argentina)**.
- **Acceso desde web**: disponible en [https://libres-inmuebles.vercel.app/](https://libres-inmuebles.vercel.app/).

> Nota sobre velocidad: al iniciar tras mucho tiempo sin uso, la API puede tardar 40–60 segundos en responder (cold start). Esto es normal y no indica un error.

## 2. Requisitos mínimos

- Navegador moderno actualizado (Chrome, Firefox, Edge, Safari).
- Conexión a internet estable.
- Para contactar por WhatsApp, tenés que tener WhatsApp instalado en tu dispositivo (PC o celular).

## 3. Roles de usuario

LibreInmuebles distingue tres roles principales para organizar permisos:

| Rol | Quién es | Permisos |
|---|---|---|
| **`buscador` (Buscador)** | Persona interesada en encontrar inmuebles. | Busca, ve fichas, envía consultas, recibe respuestas y usa el chat interno. |
| **`propietario` (Propietario)** | Dueño directo de un inmueble. | Además de buscar, puede publicar inmuebles, editar/borrar sus publicaciones, gestionar sus fotos y responder consultas en "Mis mensajes". |
| **Staff/Equipo** | Moderador interno. | Puede revisar publicaciones reportadas desde el panel de moderación. No es un rol de usuario público. |

Tu rol se asigna al registrarte (podés elegir Propietario o Buscador). Un mismo usuario puede tener rol propietario para gestionar sus publicaciones.

## 4. Registro e inicio de sesión

### Crear cuenta
1. Desde la portada, hacé clic en **"Crear cuenta gratis"** o en **"Registrate"**.
2. Completá los datos: nombre, apellido, email, teléfono (opcional), contraseña y seleccioná tu rol (**Propietario** o **Buscador**).
3. Aceptá el envío y tu cuenta se crea automáticamente. Quedás logueado al instante.

### Iniciar sesión
1. Hacé clic en **"Ingresar"** (arriba a la derecha).
2. Ingresá tu email y contraseña.
3. Podés ser redirigido a la página desde donde venías (por ejemplo, ficha de una propiedad).

### Cerrar sesión
1. Hacé clic en tu nombre/apellido en la barra superior.
2. Seleccioná **"Cerrar sesión"**. Serás redirigido al inicio.

### Sesión expirada
Si tu sesión caduca (token inválido), el sistema te desconecta automáticamente y te pide volver a ingresar. Eso es normal para mantener tu cuenta segura.

## 5. Portada y búsqueda de inmuebles

Al entrar a [https://libres-inmuebles.vercel.app/](https://libres-inmuebles.vercel.app/), vas a ver el **listado de propiedades disponibles**.

### Filtros de búsqueda
Usá los filtros para encontrar lo que necesitás:

| Filtro | Uso |
|---|---|
| **Operación** | Alquiler permanente, Alquiler temporal o Venta. |
| **Tipo** | Casa, Departamento, Terreno o Salón comercial. |
| **Barrio** | Filtrá por barrios de Paso de los Libres (lista completa disponible en la plataforma). |
| **Moneda / Precio** | Limitá precio mínimo/máximo (ARS o USD). |
| **Dormitorios** | Filtrá por cantidad mínima de dormitorios. |
| **Servicios** | Agua corriente, Luz eléctrica, Cloaca, Gas natural, Internet. |
| **Orden** | Más recientes, Más baratos, Más caros o Más grandes (superficie). |

### Resultados
- Cada tarjeta muestra foto principal, título, barrio, tipo/operación, dormitorios/baños, superficie, precio y estado (**Disponible / En negociación / Finalizada**).
- Hacé clic en cualquier tarjeta para abrir la **ficha completa**.

## 6. Ficha de propiedad (detalle)

En la ficha (`/properties/:id`) ves toda la información de la publicación.

### Secciones principales
- **Galería de fotos**: podés pasar entre imágenes con los miniaturas debajo de la foto principal.
- **Título, estado y ubicación**: barrio, dirección (si está informada), dueño/a.
- **Características**: dormitorios, baños, m² totales, expensas (si hay).
- **Descripción**: detalles completos del inmueble (formato con saltos de línea).
- **Servicios**: listados con etiquetas cuando están disponibles.
- **Mapa**: si la propiedad tiene coordenadas, se muestra un mapa aproximado (OpenStreetMap). Es aproximado para preservar privacidad.

### Contactar al propietario (requiere sesión)
Para ver datos de contacto y enviar consultas, necesitás **estar logueado**.

**Si NO estás logueado:**
- Vas a ver botones para **"Ingresar para contactar"** o **"Crear cuenta gratis"**.
- Al ingresar, volvé directamente a esa ficha.

**Si ESTÁS logueado y NO sos el dueño:**
1. Verás nombre, apellido, email y teléfono (si lo habilitó) del dueño directo.
2. Podés usar **"Enviar consulta por email"** (abre tu cliente de correo).
3. Si el dueño tiene **WhatsApp habilitado**, aparece **"Escribir por WhatsApp"** con un mensaje prearmado.
4. También podés **"Preguntar al dueño"**: desplegá el formulario, escribí tu consulta (mín. 3 caracteres) y enviá. Cuando se envía, el dueño la recibe en **Mis mensajes**. 

**Si SOS el dueño de esa publicación:**
- Aparece un aviso "Es tu publicación · ver consultas" con enlace directo a `/mensajes`.

### Reportar una publicación
Cualquier usuario logueado puede reportar una publicación que considere inapropiada:
1. En el panel lateral de la ficha, hacé clic en **"Reportar publicación"** (abajo).
2. Seleccioná un **motivo** (Spam, intermediario, datos falsos, duplicada u otro).
3. Podés agregar un **detalle opcional**.
4. Enviá el reporte. El equipo lo revisará desde el panel de moderación.

## 7. Publicar inmuebles (solo propietarios)

Si tu rol es **Propietario**, podés crear nuevas publicaciones desde **"Publicar"** (enlace superior).

### Crear una publicación
1. Ingresá a **Publicar** (`/publicar`).
2. Completá los campos obligatorios: **Título**, **Operación**, **Tipo**, **Barrio**, **Moneda**, **Precio**, **Dormitorios**, **Baños**, **Superficie (m²)**.
3. Agregá información útil: **Dirección**, **Expensas**, **Descripción**, **Servicios** (marcá los que tiene).
4. Podés marcar **"Permitir contacto por WhatsApp"** (usa el teléfono de tu perfil).
5. Guardá la publicación. Quedará visible en el listado (estado **Disponible** por defecto).

### Gestionar mis publicaciones
Desde **"Mis inmuebles"** (`/mis-inmuebles`) podés:
- Ver todas tus publicaciones (con estado, fotos y fecha).
- **Editar** cada publicación (cambios se guardan y quedan visibles).
- **Eliminar** una publicación (requiere confirmación).
- **Gestionar fotos**: agregar, quitar o reordenar fotos de tu propiedad.

### Fotos
- Podés subir varias fotos por propiedad (se muestran en galería).
- En producción las fotos se almacenan en Supabase Storage (bucket público). En desarrollo pueden guardarse localmente.
- Si una imagen tarda en aparecer, es normal el primer cacheado.

## 8. Mensajes (consultas entre usuarios)

La sección **"Mis mensajes"** (`/mensajes`) es el centro de contacto directo. Aquí recibís y respondés consultas **sin salir de la app**.

### Cómo acceder
- Menú superior → **"Mis mensajes"** (visible si estás logueado).
- También desde la ficha de tu propiedad: aviso "Es tu publicación · ver consultas".
- Cuando alguien te envía una consulta, aparece como **"Nueva"**.

### Pestañas (solo propietarios)
Si sos **Propietario**, ves dos pestañas arriba:

| Pestaña | Qué muestra |
|---|---|
| **Recibidos** | Consultas que recibiste sobre **tus** publicaciones (te escriben interesados). Muestra contador total entre paréntesis. |
| **Enviados** | Consultas que **vos enviaste** a otros propietarios (cuando preguntaste desde una ficha). |

Si sos **Buscador**, vas directo a **Enviados** (no tenés publicaciones propias).

### Funcionamiento del listado
- Cada hilo agrupa la consulta por **propiedad** + conversación.
- Muestra foto de la propiedad, título, interlocutor/a, fecha y cantidad de respuestas (si hay).
- Hilos **no leídos** (recibidos) muestran una etiqueta **"Nueva"** en azul.
- Al hacer clic en un hilo, se abre el **conversación completa**.

### Conversación (hilo)
Dentro de cada hilo ves:
- **Mensaje inicial** (consulta original) con quién lo envió y cuándo.
- **Respuestas encadenadas**: cada respuesta aparece con autor ("Vos" o nombre del otro usuario) y hora.
- Tus respuestas aparecen en **fondo azul**; las del otro usuario en **gris**.

### Marcar como leído
Cuando abrís un hilo en **Recibidos** y no estaba leído, se marca como **leído automáticamente**. Esto quita la etiqueta "Nueva".

### Actualización en tiempo real (silenciosa)
El listado se **actualiza automáticamente cada 10 segundos** mientras la pestaña está visible. 

- **No cierra** el hilo que tenés abierto.
- **No borra** lo que estás escribiendo en el borrador.
- Si hay un error puntual, el refresh es **silencioso** (no te muestra alerta molesta). Esto está pensado para no interrumpir la conversación.

### Responder dentro de la app
En cualquier hilo abierto podés escribir y enviar una respuesta:
1. Escribí tu mensaje en el textarea "Respondé dentro de la conversación…".
2. Hacé clic en **"Responder en la app"**.
3. El mensaje aparece inmediatamente en el hilo y el borrador se limpia.
4. También podés ver/usar enlaces rápidos para **contactar por WhatsApp** o **email** (dependiendo si es recibido/enviado).

### Estados vacíos
- **Recibidos vacíos**: "Todavía no recibís consultas sobre tus publicaciones. Ver inmuebles".
- **Enviados vacíos**: "No enviaste consultas todavía. Ver inmuebles".

### Paginación
Si tenés muchas consultas, aparecen botones **Anterior/Siguiente** y el número de página.

## 9. Moderación (Staff)

Si tu usuario tiene permisos de **staff**, aparece un acceso a **"Moderación"** (`/moderacion`).

- Lista publicaciones **reportadas** pendientes de revisión.
- Permite tomar acciones sobre reportes según criterio interno.
- Es un panel de trabajo interno (no necesario para uso público general).

## 10. Notificaciones y estados comunes

| Situación | Qué pasa | Acción sugerida |
|---|---|---|
| **Primera carga lenta** | La API tarda 40–60 s después de inactividad (cold start Render). | Esperá unos segundos. No recargues muchas veces. |
| **Error de servidor al responder** | Aparece "El servidor está tardando en responder (puede estar arrancando)". | Reintentá en unos momentos (esperá ~30–60 s). |
| **Sesión expirada (401)** | Te desconecta automáticamente. | Volvé a iniciar sesión. |
| **Sin fotos** | En ficha aparece "Sin fotos todavía". | Eso depende de si el propietario subió fotos. |
| **Consulta enviada** | Aparece confirmación: "Consulta enviada. El dueño la va a recibir en Mis mensajes". | Podés ir directo a Mis mensajes. |
| **Reporte enviado** | Mensaje de agradecimiento. | El equipo lo revisará. |
| **Pestaña oculta** | El polling de mensajes pausa automáticamente. | Al volver a la pestaña, se actualiza solo. |

## 11. Accesibilidad y consejos prácticos

- **Usá descripciones claras** al publicar: ayudan a recibir consultas más relevantes.
- **Fotos reales**: generan más confianza y menos consultas irrelevantes.
- **Respondé rápido** en Mis mensajes: mejor experiencia para ambos.
- **No compartas contraseñas**. LibreInmuebles nunca te la pide por mail.
- **Datos de contacto**: solo se muestran a usuarios **logueados** (protege privacidad del dueño).

## 12. Preguntas frecuentes (FAQ)

**¿Necesito registrarme para buscar?**
No. Podés navegar y ver listados/fichas sin cuenta. Para contactar sí necesitás estar logueado.

**¿Es gratis?**
Sí. LibreInmuebles es 100% gratis para buscar, publicar y contactar.

**¿Puedo publicar si soy buscador?**
Tu rol lo elegiste al registrarte. Podés tener rol "Propietario" para publicar. Si ya tenés cuenta buscador y querés publicar, podés crear otra cuenta con rol propietario o contactar al equipo si necesitás cambio de rol.

**¿Qué pasa si me escriben por WhatsApp?**
Si el dueño habilitó WhatsApp, vas a abrir un chat directo con él, con un mensaje prearmado sobre esa propiedad.

**¿Se pierden mis borradores al escribir en mensajes?**
No. Mientras escribís una respuesta, el texto queda en el borrador del hilo aunque el listado se actualice cada 10 segundos (polling silencioso). Solo se limpia al enviar la respuesta.

**¿Dónde veo las respuestas a mi consulta?**
En **Mis mensajes → Enviados** (o Recibidos si sos dueño). Al abrir el hilo ves toda la conversación.

## 13. Soporte

Para reportar errores, sugerencias o problemas técnicos:
- Desde la app podés usar **Reportar publicación** para casos de contenido.
- Para problemas generales, podés contactar al equipo de desarrollo/documentación del proyecto.

**Versión del manual:** Octubre 2026  
**Plataforma:** LibreInmuebles (web)  
**URL oficial:** [https://libres-inmuebles.vercel.app/](https://libres-inmuebles.vercel.app/)