# 🐾 PetRadar Pro

API de microservicios para gestión de mascotas, búsqueda geoespacial con PostGIS y monitoreo de salud.

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────┐
│         NestJS REST API (TypeScript)         │
├──────────┬──────────┬──────────┬────────────┤
│ Auth Svc │ Pets Svc │Health Svc│Location Svc│
│  (JWT)   │  (SQL)   │ (NoSQL)  │ (PostGIS)  │
└──────────┴──────────┴──────────┴────────────┘
      │         │          │           │
   PostgreSQL  │     MongoDB      Redis
   + PostGIS   │                  (cache)
```

## 📦 Tecnologías

| Capa | Tecnología |
|------|-----------|
| Backend | NestJS + TypeScript |
| SQL | PostgreSQL + PostGIS (geoespacial) |
| NoSQL | MongoDB (historial médico) |
| Cache | Redis (endpoints GET) |
| Auth | JWT (JSON Web Tokens) |
| Telemetría | Azure Application Insights |
| Contenerización | Docker + Docker Compose |
| CI/CD | GitHub Actions → GHCR |
| Docs | Swagger (OpenAPI) |

## 🚀 Quick Start

```bash
# 1. Levantar servicios (Postgres, MongoDB, Redis)
docker-compose up -d postgres mongodb redis

# 2. Instalar dependencias
npm install

# 3. Iniciar API en desarrollo
npm run start:dev

# 4. Swagger docs
open http://localhost:3000/api/docs
```

## 📡 Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Login (JWT) |
| GET | `/api/auth/profile` | Perfil del usuario |
| POST | `/api/pets` | Registrar mascota |
| GET | `/api/pets` | Listar mis mascotas |
| POST | `/api/lost-pets` | Reportar mascota perdida |
| GET | `/api/lost-pets` | Ver perdidas (🟢 Redis) |
| POST | `/api/found-pets` | Reportar encontrada (🔍 radio 500m) |
| GET | `/api/found-pets` | Ver encontradas (🟢 Redis) |
| GET | `/api/location/search?lat=19.43&lng=-99.13&radius=500` | Búsqueda geoespacial |
| POST | `/api/health` | Registro médico (NoSQL) |
| GET | `/api/health/pet/:petId` | Historial por mascota |

## 🔍 Búsqueda por radio (PostGIS)

Al crear un `found_pet`, el sistema busca automáticamente mascotas perdidas activas en un radio de 500 metros usando `ST_DWithin` con cast `::geography`.

```sql
ST_DWithin(lp.location::geography, 
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, 500)
```

## 🐳 Docker

```bash
# Build local
docker build -t petradar-api .

# Usar docker-compose completo
docker-compose up -d

# Imagen en GHCR
docker pull ghcr.io/TU_USUARIO/petradar-api:latest
```

## 📊 Monitoreo

Azure Application Insights se activa configurando la variable:
```
APPINSIGHTS_INSTRUMENTATIONKEY=tu-key
```

---

Hecho por **Darko** — Proyecto universitario 2026 🎓
