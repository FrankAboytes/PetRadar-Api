# 🐾 PetRadar Pro — Backend API

API de microservicios para gestion de mascotas, busqueda geoespacial con PostGIS, monitoreo de salud y comunidad de rescate animal.

---

## Arquitectura

```
┌──────────────────────────────────────────────────────────────────┐
│                    NestJS REST API (TypeScript)                    │
├──────────┬──────────┬──────────┬──────────┬──────────┬───────────┤
│ Auth Svc │ Pets Svc │Health Svc│Location  │Notif Svc │Community  │
│  (JWT)   │  (SQL)   │ (NoSQL)  │(PostGIS) │ (Push)   │ (Reports) │
└──────────┴──────────┴──────────┴──────────┴──────────┴───────────┘
      │         │          │           │          │           │
   PostgreSQL  │     MongoDB      Redis    PostgreSQL    MongoDB
   + PostGIS   │                  (cache)
```

## Tecnologias

| Capa | Tecnologia |
|------|-----------|
| Backend | NestJS + TypeScript |
| SQL | PostgreSQL + PostGIS (geoespacial) |
| NoSQL | MongoDB (historial medico, chat, actividad) |
| Cache | Redis (endpoints GET) |
| Auth | JWT + bcrypt |
| Telemetria | Azure Application Insights (OpenTelemetry) |
| Contenerizacion | Docker + Docker Compose |
| CI/CD | GitHub Actions -> GHCR |
| Docs | Swagger (OpenAPI) |

## Base de Datos — 12 Tablas/Colecciones

### PostgreSQL (TypeORM) — 9 tablas

| # | Tabla | Columnas | Proposito |
|---|-------|----------|-----------|
| 1 | `users` | 7 | Usuarios (registro, auth, roles) |
| 2 | `pets` | 11 | Mascotas registradas por dueños |
| 3 | `lost_pets` | 8 + geometry | Reportes de mascotas perdidas (PostGIS) |
| 4 | `found_pets` | 9 + geometry | Reportes de mascotas encontradas (PostGIS) |
| 5 | `breeds` | 5 | Catalogo de razas por especie |
| 6 | `notifications` | 10 | Notificaciones push a usuarios |
| 7 | `location_history` | 9 | Historial de ubicacion GPS (AirTag) |
| 8 | `community_reports` | 12 | Reportes comunitarios de avistamientos |
| 9 | `veterinaries` | 13 | Directorio de clinicas veterinarias |

### MongoDB (Mongoose) — 3 colecciones

| # | Coleccion | Campos | Proposito |
|---|-----------|--------|-----------|
| 10 | `health_records` | 7 | Historial medico flexible |
| 11 | `chat_messages` | 7 | Chat entre dueños y rescatistas |
| 12 | `activity_log` | 7 | Auditoria de actividad (TTL 90 dias) |

## Quick Start

```bash
# 1. Levantar servicios (Postgres, MongoDB, Redis)
docker compose up -d

# 2. Instalar dependencias
npm install

# 3. Migraciones y seed
npx typeorm migration:run
node seed.js

# 4. Iniciar API
npm run start:dev

# 5. Swagger docs
open http://localhost:3000/api/docs
```

## Endpoints principales

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Login (JWT) |
| GET | `/api/auth/profile` | Perfil del usuario |
| PUT | `/api/auth/profile` | Actualizar perfil |
| POST | `/api/pets` | Registrar mascota |
| GET | `/api/pets` | Listar mis mascotas |
| GET | `/api/pets/:id` | Detalle de mascota |
| PUT | `/api/pets/:id` | Actualizar mascota |
| DELETE | `/api/pets/:id` | Eliminar mascota |
| POST | `/api/lost-pets` | Reportar mascota perdida |
| GET | `/api/lost-pets` | Listar perdidas activas |
| PUT | `/api/lost-pets/:id/resolve` | Marcar como resuelta |
| POST | `/api/found-pets` | Reportar mascota encontrada (busca 500m) |
| GET | `/api/found-pets` | Listar encontradas |
| GET | `/api/location/search?lat=19.43&lng=-99.13&radius=500` | Busqueda geoespacial |
| POST | `/api/health` | Registro medico (MongoDB) |
| GET | `/api/health/pet/:petId` | Historial medico por mascota |
| GET | `/api/breeds` | Catalogo de razas |
| GET | `/api/breeds?species=dog` | Razas por especie |
| GET | `/api/notifications` | Mis notificaciones |
| PUT | `/api/notifications/:id/read` | Marcar como leida |
| GET | `/api/locations/:petId` | Historial de ubicaciones |
| POST | `/api/locations` | Registrar ubicacion |
| GET | `/api/reports` | Reportes comunitarios |
| POST | `/api/reports` | Crear reporte |
| POST | `/api/reports/:id/upvote` | Apoyar reporte |
| GET | `/api/veterinaries` | Directorio de veterinarias |
| GET | `/api/veterinaries/nearby?lat=X&lng=Y&radius=5000` | Veterinarias cercanas |
| GET | `/api/chat/:petId` | Mensajes de chat |
| POST | `/api/chat` | Enviar mensaje |
| GET | `/api/dashboard/summary` | Resumen de actividad |

## Busqueda por radio (PostGIS)

Al crear un `found_pet`, el sistema busca automaticamente mascotas perdidas activas en un radio de 500 metros usando `ST_DWithin` con cast `::geography`.

```sql
ST_DWithin(lp.location::geography, 
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, 500)
```

## Docker

```bash
# Build local
docker build -t petradar-api .

# Usar docker-compose completo
docker compose up -d

# Imagen en GHCR
docker pull ghcr.io/FrankAboytes/petradar-api:latest
```

## Deploy en Railway

```bash
# 1. Conectar repo de GitHub en Railway Dashboard
# 2. Agregar servicios: PostgreSQL + MongoDB
# 3. Variables de entorno (Railway las configura automaticamente):
#    - DATABASE_URL (proveida por Railway PostgreSQL)
#    - MONGO_URL (proveida por Railway MongoDB)
#    - JWT_SECRET (generar manual)
#    - REDIS_URL (opcional — agregar servicio Redis)
#    - PORT=3000
#    - NODE_ENV=production
# 4. La app usa el archivo railway.toml para configuracion automatica
```

## Variables de Entorno (.env)

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/petradar
MONGODB_URI=mongodb://localhost:27017/petradar
REDIS_URL=redis://localhost:6379
JWT_SECRET=tu-jwt-secret
APPINSIGHTS_INSTRUMENTATIONKEY=InstrumentationKey=...;IngestionEndpoint=...
PORT=3000
```

## Monitoreo

Azure Application Insights via OpenTelemetry (`@azure/monitor-opentelemetry`):

```
📊 Application Insights + Live Metrics activado → petradar-incident-telemetry
```

---

**v1.1** — 12 tablas (9 PostgreSQL + 3 MongoDB) — Proyecto universitario 2026 🎓
