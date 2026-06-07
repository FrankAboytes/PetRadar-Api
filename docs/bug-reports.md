# PetRadar Pro — Bug Reports

## Registro de Defectos Encontrados

---

### BUG-001: La búsqueda geoespacial no encuentra mascotas cercanas

| Campo | Valor |
|-------|-------|
| **Título** | PostGIS ST_DWithin no retorna resultados con radios pequeños |
| **Severidad** | Critical |
| **Prioridad** | High |
| **Entorno** | Local, Docker, PostgreSQL 16 + PostGIS, Node.js 26 |
| **Versión** | v1.0 |
| **Módulo** | POST /api/found-pets — búsqueda por radio |

**Comportamiento actual:** Al reportar una mascota encontrada con coordenadas cercanas a una mascota perdida (menos de 200 metros), el sistema no retorna la mascota perdida en el array `nearbyLostPets`.

**Comportamiento esperado:** El sistema debe retornar todas las mascotas perdidas activas dentro de un radio de 500 metros.

**Pasos para reproducir:**
1. Crear un lost_pet en coordenadas (20.5713, -101.1918)
2. Crear un found_pet en coordenadas (20.5720, -101.1920) — ~80 metros de distancia
3. Verificar que la respuesta incluya `nearbyLostPets` con el lost_pet creado

**Evidencia:** La query SQL `ST_DWithin(ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, lp.location::geography, 500)` no retorna resultados aunque la distancia sea menor a 500m.

**Causa raíz:** La columna `petId` en `lost_pets` es VARCHAR pero la relación JOIN con `pets.id` (UUID) requiere cast explícito. El JOIN falla silenciosamente y no retorna distancias.

**Asignado a:** Darko
**Estado:** Fixed — se agregó `p.id::text = lp."petId"` en el JOIN.

---

### BUG-002: Cache en Redis impide ver nuevos reportes

| Campo | Valor |
|-------|-------|
| **Título** | GET /api/lost-pets y GET /api/found-pets cachean resultados y no muestran nuevos reportes |
| **Severidad** | High |
| **Prioridad** | High |
| **Entorno** | Local, Docker, Redis 7 |
| **Versión** | v1.0 |
| **Módulo** | GET /api/lost-pets, GET /api/found-pets |

**Comportamiento actual:** Después de crear un nuevo reporte de mascota perdida, el endpoint GET no lo muestra hasta que expira el cache de Redis (60 segundos).

**Comportamiento esperado:** Los nuevos reportes deben aparecer inmediatamente.

**Pasos para reproducir:**
1. GET /api/lost-pets → retorna lista actual
2. POST /api/lost-pets → crear nuevo reporte (201 Created)
3. GET /api/lost-pets → retorna la MISMA lista sin el nuevo reporte

**Evidencia:** El endpoint GET tiene el decorador `@UseInterceptors(CacheInterceptor)` que cachea respuestas.

**Causa raíz:** `CacheInterceptor` de NestJS aplicado globalmente al endpoint de lectura.

**Asignado a:** Darko
**Estado:** Fixed — se eliminó `CacheInterceptor` de lost-pets y found-pets.

---

### BUG-003: Confirmación de encontrada accesible para cualquier usuario

| Campo | Valor |
|-------|-------|
| **Título** | Cualquier usuario puede confirmar una mascota encontrada sin ser el dueño |
| **Severidad** | High |
| **Prioridad** | High |
| **Entorno** | Local, cualquier navegador |
| **Versión** | v1.0 |
| **Módulo** | POST /api/found-pets/:id/confirm |

**Comportamiento actual:** Cualquier usuario autenticado puede confirmar que una mascota fue encontrada, incluso si no es el dueño.

**Comportamiento esperado:** Solo el dueño de la mascota perdida debe poder confirmar el encuentro. Si no es el dueño, debe retornar 403 Forbidden.

**Pasos para reproducir:**
1. Login como usuario A (no dueño de la mascota)
2. POST /api/found-pets/:id/confirm → retorna 200 OK
3. La mascota se marca como encontrada sin el consentimiento del dueño

**Causa raíz:** El endpoint no verifica el ownerId del pet contra el userId del token JWT.

**Asignado a:** Darko
**Estado:** Fixed — se agregó verificación de propiedad: `pet.ownerId !== userId → ForbiddenException`.

---

### BUG-004: Seed data usa columnas incorrectas

| Campo | Valor |
|-------|-------|
| **Título** | El script seed.js intenta insertar en columnas que no existen en found_pets |
| **Severidad** | Critical |
| **Prioridad** | Blocker |
| **Entorno** | Local, Docker |
| **Versión** | v1.0 |
| **Módulo** | Seed script |

**Comportamiento actual:** `node seed.js` falla con error `column "finderName" of relation "found_pets" does not exist`.

**Comportamiento esperado:** El seed debe ejecutarse sin errores y poblar todas las tablas.

**Pasos para reproducir:**
1. `node seed.js` → error inmediato

**Causa raíz:** La entidad `FoundPet` no tiene las columnas `finderName` ni `photoUrl`, pero el seed intentaba insertarlas.

**Asignado a:** Darko
**Estado:** Fixed — seed actualizado para usar columnas reales (`description`, `petId`, `matchedLostPetId`, `matchDistance`).

---

### BUG-005: Error al guardar perfil de usuario

| Campo | Valor |
|-------|-------|
| **Título** | Al guardar datos del perfil (teléfono/ciudad), el backend no actualiza correctamente |
| **Severidad** | Medium |
| **Prioridad** | Medium |
| **Entorno** | Local, cualquier navegador |
| **Versión** | v1.0 |
| **Módulo** | PATCH /api/auth/profile |

**Comportamiento actual:** Al enviar el formulario de edición de perfil, el frontend muestra "Error al guardar" y los datos no se actualizan.

**Comportamiento esperado:** El perfil debe actualizarse con los nuevos datos de teléfono y ciudad.

**Pasos para reproducir:**
1. Login como cualquier usuario
2. Clic en el avatar → editar perfil
3. Cambiar teléfono y ciudad
4. Clic en "Guardar" → toast "Error al guardar"

**Causa raíz:** El backend no filtraba campos undefined/null, intentando actualizar columnas con valores inválidos. Además, `updateProfile` retornaba el password hasheado en la respuesta.

**Asignado a:** Darko
**Estado:** Fixed — se filtraron campos vacíos y se excluyó password del response.
