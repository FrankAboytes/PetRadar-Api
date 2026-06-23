# 🚀 PetRadar Pro — Despliegue a Railway (Guía paso a paso)

## Requisitos
- Cuenta en [Railway](https://railway.app/) (GitHub OAuth)
- Repositorio subido a GitHub

---

## Paso 1: Subir el código a GitHub

```bash
cd ~/Documentos/Universidad/8toSemestre/Calidad\ de\ software/petradar-api

# Configurar remote
git remote add origin https://github.com/FrankAboytes/PetRadar-Api.git

# Subir
git push -u origin main
```

---

## Paso 2: Crear proyecto en Railway

1. Ir a https://railway.app/
2. Clic en **"New Project"**
3. Seleccionar **"Deploy from GitHub repo"**
4. Conectar tu cuenta de GitHub
5. Seleccionar el repo `FrankAboytes/PetRadar-Api`
6. Railway detectará automáticamente `railway.toml` y desplegará

---

## Paso 3: Agregar PostgreSQL

1. En el dashboard de Railway, dentro del proyecto, clic en **"New"**
2. Seleccionar **"Database" → "PostgreSQL"**
3. Esperar a que se provisione (~30 segundos)
4. Railway inyecta automáticamente la variable `DATABASE_URL` al backend

---

## Paso 4: Agregar MongoDB

1. Clic en **"New"** nuevamente
2. Seleccionar **"Database" → "MongoDB"**
3. Esperar a que se provisione
4. Ir a la pestaña **"Connect"** del MongoDB
5. Copiar la cadena de conexión (MongoDB URI)
6. Ir al servicio del **backend**
7. Ir a la pestaña **"Variables"**
8. Agregar variable: `MONGO_URL` = (la cadena que copiaste)

---

## Paso 5: Agregar variables de entorno

En la pestaña **Variables** del backend, agregar:

| Variable | Valor |
|----------|-------|
| `JWT_SECRET` | Una clave secreta (ej: `petradar-jwt-secret-2026-xyz`) |
| `NODE_ENV` | `production` |
| `LOG_LEVEL` | `info` |

La `DATABASE_URL` se inyecta automáticamente desde PostgreSQL.

---

## Paso 6: Verificar despliegue

Railway te dará una URL como: `https://petradar-api-production.up.railway.app`

Probar:

```bash
# Health check
curl https://petradar-api-production.up.railway.app/api/monitoring/health

# Swagger docs
# Abrir en navegador: https://petradar-api-production.up.railway.app/api/docs

# Registrar usuario
curl -X POST https://petradar-api-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"darko@test.com","password":"Flanax123!","name":"Darko"}'

# Login
curl -X POST https://petradar-api-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"darko@test.com","password":"Flanax123!"}'
```

---

## Paso 7: Verificar que los datos vienen de la BD en línea

```bash
# 1. Login
TOKEN=$(curl -s -X POST https://petradar-api-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"darko@test.com","password":"Flanax123!"}' | python3 -c "import json,sys; print(json.load(sys.stdin)['access_token'])")

# 2. Crear mascota (datos guardados en Railway PostgreSQL)
curl -X POST https://petradar-api-production.up.railway.app/api/pets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Firulais","species":"dog","breed":"Labrador","color":"Café"}'

# 3. Leer mascotas (datos desde BD en línea)
curl -H "Authorization: Bearer $TOKEN" \
  https://petradar-api-production.up.railway.app/api/pets
```

---

## 📹 Video demo (3-5 min) — Guión sugerido

### Qué mostrar en el video:

| Minuto | Qué mostrar |
|--------|-------------|
| 0:00-0:30 | **Intro**: "Este es PetRadar Pro, una API REST para búsqueda geoespacial de mascotas" |
| 0:30-1:00 | **Railway dashboard**: Mostrar el proyecto en Railway con los servicios (backend, PostgreSQL, MongoDB) |
| 1:00-1:30 | **Variables de entorno**: Mostrar DATABASE_URL, MONGO_URL, JWT_SECRET configuradas |
| 1:30-2:00 | **Swagger docs**: Abrir `/api/docs` en el navegador — mostrar todos los endpoints disponibles |
| 2:00-3:00 | **POST /auth/register** en Postman/navegador: registrar usuario, mostrar respuesta con token |
| 3:00-3:30 | **GET /pets** con token: mostrar que devuelve datos reales de la BD |
| 3:30-4:00 | **GET /lost-pets?lat=21.12&lng=-101.68**: búsqueda geoespacial desde la BD |
| 4:00-4:30 | **GET /monitoring/metrics**: mostrar métricas RED en tiempo real |
| 4:30-5:00 | **Cierre**: "Código en github.com/FrankAboytes/PetRadar-Api, documentación completa" |

---

## 📦 Entregables para el profesor

1. **URL pública de la API**: `https://petradar-api-production.up.railway.app`
2. **Endpoint de lectura** que devuelve datos reales: `GET /api/pets` (requiere token)
3. **Endpoint público** (sin auth): `GET /api/monitoring/health` o `GET /lost-pets`
4. **Video** de 3-5 min siguiendo el guión de arriba
5. **Repositorio GitHub**: `https://github.com/FrankAboytes/PetRadar-Api`
