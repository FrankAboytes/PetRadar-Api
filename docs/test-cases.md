# PetRadar Pro — Casos de Prueba (Test Cases)

## Convención
- `TC-API-XXX` → Endpoints REST
- `TC-UI-XXX` → Frontend/UI
- `TC-DB-XXX` → Base de datos
- `TC-SEC-XXX` → Seguridad

---

### TC-API-001: Registro de usuario exitoso

| Campo | Valor |
|-------|-------|
| **Módulo** | Auth |
| **Título** | POST /auth/register — registro con datos válidos retorna 201 + token |
| **Precondiciones** | Email no registrado previamente |
| **Datos de entrada** | `{"email": "test@example.com", "password": "SecurePass123!", "name": "Test User"}` |
| **Pasos** | 1. Enviar POST /auth/register con body JSON<br>2. Verificar status 201 Created<br>3. Verificar body tiene `access_token` y `user` |
| **Resultado esperado** | Status 201, token JWT, user con id/email/name |
| **Resultado real** | |
| **Estado** | ⬜ |
| **Severidad** | Critical |
| **Prioridad** | High |
| **Automatizado** | Sí |
| **Ref** | RF-001 |

---

### TC-API-002: Registro con email duplicado

| Campo | Valor |
|-------|-------|
| **Módulo** | Auth |
| **Título** | POST /auth/register — email duplicado retorna 401 |
| **Precondiciones** | Email ya registrado en BD |
| **Datos de entrada** | `{"email": "existing@test.com", "password": "Pass123!", "name": "Duplicate"}` |
| **Pasos** | 1. Registrar usuario A con email X<br>2. Intentar registrar usuario B con mismo email X |
| **Resultado esperado** | Status 401 Unauthorized, mensaje "Email ya registrado" |
| **Resultado real** | |
| **Estado** | ⬜ |
| **Severidad** | Medium |
| **Prioridad** | High |
| **Automatizado** | Sí |
| **Ref** | RF-001 |

---

### TC-API-003: Login exitoso

| Campo | Valor |
|-------|-------|
| **Módulo** | Auth |
| **Título** | POST /auth/login — credenciales válidas retorna 201 + JWT |
| **Precondiciones** | Usuario registrado |
| **Datos de entrada** | `{"email": "test@example.com", "password": "SecurePass123!"}` |
| **Pasos** | 1. Enviar POST /auth/login con body JSON<br>2. Verificar status 201<br>3. Verificar token y user en respuesta |
| **Resultado esperado** | Status 201, token JWT válido, objeto user |
| **Resultado real** | |
| **Estado** | ⬜ |
| **Severidad** | Critical |
| **Prioridad** | High |
| **Automatizado** | Sí |
| **Ref** | RF-002 |

---

### TC-API-004: Login con credenciales inválidas

| Campo | Valor |
|-------|-------|
| **Módulo** | Auth |
| **Título** | POST /auth/login — contraseña incorrecta retorna 401 |
| **Precondiciones** | Usuario registrado |
| **Datos de entrada** | `{"email": "test@example.com", "password": "WrongPass99!"}` |
| **Pasos** | 1. Enviar POST /auth/login con contraseña incorrecta |
| **Resultado esperado** | Status 401, mensaje "Credenciales inválidas" |
| **Resultado real** | |
| **Estado** | ⬜ |
| **Severidad** | High |
| **Prioridad** | High |
| **Automatizado** | Sí |
| **Ref** | RF-002 |

---

### TC-API-005: Crear mascota (autenticado)

| Campo | Valor |
|-------|-------|
| **Módulo** | Pets |
| **Título** | POST /pets — creación exitosa con token JWT |
| **Precondiciones** | Usuario autenticado con token válido |
| **Datos de entrada** | `{"name": "Firulais", "species": "dog", "breed": "Labrador", "color": "Café", "age": 3}` |
| **Pasos** | 1. Enviar POST /pets con Authorization header + body<br>2. Verificar status 201<br>3. Verificar pet creado con datos correctos |
| **Resultado esperado** | Status 201, pet con id, name, species, ownerId |
| **Resultado real** | |
| **Estado** | ⬜ |
| **Severidad** | Critical |
| **Prioridad** | High |
| **Automatizado** | Sí |
| **Ref** | RF-003 |

---

### TC-API-006: Crear mascota SIN autenticación

| Campo | Valor |
|-------|-------|
| **Módulo** | Pets |
| **Título** | POST /pets — sin token retorna 401 |
| **Precondiciones** | Ninguna |
| **Datos de entrada** | Mismo body que TC-API-005 pero sin header Authorization |
| **Pasos** | 1. Enviar POST /pets SIN token |
| **Resultado esperado** | Status 401 Unauthorized |
| **Resultado real** | |
| **Estado** | ⬜ |
| **Severidad** | Critical |
| **Prioridad** | High |
| **Automatizado** | Sí |
| **Ref** | RF-003, RF-020 |

---

### TC-API-007: Listar mascotas perdidas con coordenadas

| Campo | Valor |
|-------|-------|
| **Módulo** | Lost Pets |
| **Título** | GET /lost-pets?lat=20.57&lng=-101.19 — búsqueda geográfica retorna 200 + array |
| **Precondiciones** | Al menos 1 lost pet en BD cerca de las coordenadas |
| **Datos de entrada** | Query params `lat=20.5713&lng=-101.1918` |
| **Pasos** | 1. Enviar GET /lost-pets con query params<br>2. Verificar status 200<br>3. Verificar array de lost pets con distancias |
| **Resultado esperado** | Status 200, array con lost pets, cada uno con `distance` en metros |
| **Resultado real** | |
| **Estado** | ⬜ |
| **Severidad** | High |
| **Prioridad** | High |
| **Automatizado** | Sí |
| **Ref** | RF-004 |

---

### TC-API-008: Confirmar encontrada sin ser el dueño

| Campo | Valor |
|-------|-------|
| **Módulo** | Found Pets |
| **Título** | POST /found-pets/:id/confirm — usuario no dueño retorna 403 |
| **Precondiciones** | Found pet existe, usuario A autenticado (no dueño del lost pet) |
| **Datos de entrada** | Token de usuario A + ID de found pet del usuario B |
| **Pasos** | 1. Login como usuario A<br>2. Enviar POST /found-pets/:id/confirm<br>3. Verificar status 403 |
| **Resultado esperado** | Status 403 Forbidden |
| **Resultado real** | |
| **Estado** | ⬜ |
| **Severidad** | High |
| **Prioridad** | High |
| **Automatizado** | Sí |
| **Ref** | RF-005, RF-020 |

---

### TC-API-009: Recurso inexistente

| Campo | Valor |
|-------|-------|
| **Módulo** | Pets |
| **Título** | GET /pets/:id — ID inexistente retorna 404 |
| **Precondiciones** | Ninguna |
| **Datos de entrada** | ID `00000000-0000-0000-0000-000000000000` |
| **Pasos** | 1. Enviar GET /pets/:id con UUID inexistente |
| **Resultado esperado** | Status 404 Not Found |
| **Resultado real** | |
| **Estado** | ⬜ |
| **Severidad** | Medium |
| **Prioridad** | Medium |
| **Automatizado** | Sí |
| **Ref** | RF-003 |

---

### TC-API-010: Reportar mascota encontrada con coordenadas

| Campo | Valor |
|-------|-------|
| **Módulo** | Found Pets |
| **Título** | POST /found-pets — reporte con datos válidos retorna 201 |
| **Precondiciones** | Usuario autenticado |
| **Datos de entrada** | `{"description": "Perro café encontrado en el parque", "latitude": 20.5720, "longitude": -101.1920, "photoUrl": "https://..."}` |
| **Pasos** | 1. Enviar POST /found-pets con body<br>2. Verificar status 201<br>3. Verificar nearbyLostPets tiene resultados |
| **Resultado esperado** | Status 201, found pet creado, array nearbyLostPets con distancias |
| **Resultado real** | |
| **Estado** | ⬜ |
| **Severidad** | High |
| **Prioridad** | High |
| **Automatizado** | Sí |
| **Ref** | RF-004 |

---

### TC-UI-001: Login desde el navegador

| Campo | Valor |
|-------|-------|
| **Módulo** | UI / Login |
| **Título** | Login exitoso redirige al Dashboard |
| **Precondiciones** | Usuario registrado |
| **Datos de entrada** | email + password válidos |
| **Pasos** | 1. Navegar a /login<br>2. Completar formulario<br>3. Click en "Iniciar sesión"<br>4. Verificar redirección a /dashboard |
| **Resultado esperado** | Dashboard visible con cards de stats |
| **Resultado real** | |
| **Estado** | ⬜ |
| **Severidad** | Critical |
| **Prioridad** | High |
| **Automatizado** | Sí (Cypress TC-01) |
| **Ref** | RF-002 |

---

### TC-UI-002: Registro de mascota desde UI

| Campo | Valor |
|-------|-------|
| **Módulo** | UI / Pets |
| **Título** | Formulario de registro de mascota crea el recurso |
| **Precondiciones** | Usuario autenticado |
| **Datos de entrada** | name="Firulais", species="dog", breed="Labrador", color="Café" |
| **Pasos** | 1. Navegar a /pets<br>2. Click "Registrar Mascota"<br>3. Completar formulario<br>4. Click "Guardar"<br>5. Verificar mascota aparece en lista |
| **Resultado esperado** | Mascota visible en la tabla de mascotas |
| **Resultado real** | |
| **Estado** | ⬜ |
| **Severidad** | High |
| **Prioridad** | High |
| **Automatizado** | Sí (Cypress TC-02) |
| **Ref** | RF-003 |

---

### TC-DB-001: Constraints de unicidad en email

| Campo | Valor |
|-------|-------|
| **Módulo** | BD / Users |
| **Título** | UNIQUE constraint evita emails duplicados |
| **Precondiciones** | Usuario con email X existe |
| **Datos de entrada** | Segundo registro con mismo email |
| **Pasos** | 1. Insertar usuario con email X<br>2. Insertar segundo usuario con mismo email<br>3. Verificar error de constraint |
| **Resultado esperado** | Error: duplicate key value violates unique constraint |
| **Resultado real** | |
| **Estado** | ⬜ |
| **Severidad** | High |
| **Prioridad** | High |
| **Automatizado** | Pendiente |
| **Ref** | RF-001 |

---

### TC-SEC-001: Headers de seguridad

| Campo | Valor |
|-------|-------|
| **Módulo** | Security |
| **Título** | Headers HTTP de seguridad presentes en todas las respuestas |
| **Precondiciones** | Backend corriendo |
| **Datos de entrada** | Request GET a /health |
| **Pasos** | 1. Enviar GET /health<br>2. Verificar headers: x-content-type-options, x-frame-options, strict-transport-security |
| **Resultado esperado** | Todos los headers de seguridad presentes |
| **Resultado real** | |
| **Estado** | ⬜ |
| **Severidad** | High |
| **Prioridad** | Medium |
| **Automatizado** | Sí |
| **Ref** | OWASP A05 |

---

### TC-SEC-002: Rate limiting en login

| Campo | Valor |
|-------|-------|
| **Módulo** | Security |
| **Título** | Múltiples intentos de login fallidos son bloqueados |
| **Precondiciones** | Usuario registrado |
| **Datos de entrada** | 10 requests rápidos con contraseña incorrecta |
| **Pasos** | 1. Enviar POST /auth/login 10 veces en 5 segundos<br>2. Verificar que los últimos requests retornan 429 Too Many Requests |
| **Resultado esperado** | Rate limiting activo: status 429 después de N intentos |
| **Resultado real** | |
| **Estado** | ⬜ |
| **Severidad** | High |
| **Prioridad** | High |
| **Automatizado** | Pendiente |
| **Ref** | OWASP A07 |
