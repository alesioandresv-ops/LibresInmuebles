# LibreInmuebles — Diagrama Entidad-Relación

Plataforma P2P "Dueño Directo" para Paso de los Libres, Corrientes.

## Relaciones

```
User (propietario)  1 ── ∞ Property (owner_id)
Property            1 ── ∞ PropertyImage  (property_id)
Property            1 ── ∞ Report         (property_id)  ∞ ── 1 User (reporter_id)
Property            1 ── ∞ Inquiry        (property_id)  ∞ ── 1 User (sender_id)
```

## Modelo

| Modelo | Campos | Índices |
|---|---|---|
| **User** | id, email (únic), password_hash, first_name, last_name, phone?, whatsapp?, role (propietario/buscador), **declaration_titular** (declaración jurada anti-agencia), is_active, created_at, updated_at | email (unique) |
| **Property** | id, owner_id FK, operation_type (alquiler_permanente/alquiler_temporal/venta), property_type (casa/departamento/terreno/salon_comercial), status (disponible/en_negociacion/finalizada), title, description, price, currency (ARS/USD), monthly_fees?, bedrooms?, bathrooms?, surface_m2?, neighborhood, address, latitude?/longitude?, **has_water/has_electricity/has_sewage/has_gas/has_internet** (bool), contact_whatsapp?, allow_whatsapp, created_at, updated_at | owner_id, neighborhood, price, **(status, operation_type, property_type)** |
| **PropertyImage** | id, property_id FK, url, orden, is_primary | property_id |
| **Report** | id, property_id FK, reporter_id FK, reason (spam/intermediario_real/datos_falsos/duplicada/otro), details?, status (pendiente/revisado/rechazado), created_at | property_id, status |
| **Inquiry** | id, property_id FK, sender_id FK, message, is_read, created_at | property_id, sender_id |

## Decisiones de diseño

- **Servicios como columnas booleanas** en `Property` (no tabla intermedia): el requisito es "presencia de servicios clave" y simplifica el filtrado SQL (ej. `WHERE has_water = true`).
- **Enums con `values_callable`** para persistir valores legibles (`venta`, `casa`, …) en la BD en lugar de nombres técnicos.
- **`declaration_titular` obligatorio** en `User`: declaración jurada de titular/poseedor directo exigida por el dominio anti-agencia.
- **Soft estados** en `Property.status` (disponible → en_negociacion → finalizada) y `Report.status` para moderación comunitaria.
- **Lat/lng opcionales**: alimentan el "mapa aproximado" del detalle sin exigir geocodificación al publicar.
- **`allow_whatsapp`**: el botón de WhatsApp solo se muestra si el propietario lo habilitó y el visitante está autenticado (control anti-scraping).
- **`ondelete=CASCADE`** en Property→images/reports/inquiries y User→properties: integridad referencial servida por la BD.
- **Índice compuesto** en `(status, operation_type, property_type)` cubre el filtro combinado del motor de búsqueda sin N+1.
- Barreras `CheckConstraint`: precios/no-negatividad, títulos mínimos → validación a nivel de BD además de Pydantic.

## Suciedad de N+1 (plan Paso 3)

El feed y el detalle usarán `selectinload()`/`joinedload()` sobre `images` (solo `is_primary` en tarjetas) y `owner` para evitar consultas anidadas.