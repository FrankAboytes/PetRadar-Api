#!/bin/bash
# PetRadar Pro — Startup Script
# Levanta servicios con datos persistentes

PROJECT_DIR="$HOME/Documentos/Universidad/8toSemestre/Calidad de software/petradar-api"
DATA_DIR="$HOME/.petradar-data"

echo "🐾 PetRadar Pro — Iniciando servicios..."
mkdir -p "$DATA_DIR/postgres" "$DATA_DIR/mongo" "$DATA_DIR/redis"

# 1. PostgreSQL + PostGIS (persistente)
echo "📦 PostgreSQL..."
docker rm -f petradar-postgres 2>/dev/null
docker run -d --name petradar-postgres \
  -p 5432:5432 \
  -e POSTGRES_DB=petradar_db \
  -e POSTGRES_USER=petuser \
  -e POSTGRES_PASSWORD=petpassword \
  -v "$DATA_DIR/postgres:/var/lib/postgresql/data" \
  --restart unless-stopped \
  postgis/postgis:15-3.3

# 2. MongoDB (persistente)
echo "📦 MongoDB..."
docker rm -f petradar-mongo 2>/dev/null
docker run -d --name petradar-mongo \
  -p 27017:27017 \
  -v "$DATA_DIR/mongo:/data/db" \
  --restart unless-stopped \
  mongo:7

# 3. Redis (persistente)
echo "📦 Redis..."
docker rm -f petradar-redis 2>/dev/null
docker run -d --name petradar-redis \
  -p 6379:6379 \
  -v "$DATA_DIR/redis:/data" \
  --restart unless-stopped \
  redis:7-alpine redis-server --appendonly yes

# 4. Esperar a que PostgreSQL esté listo
echo "⏳ Esperando PostgreSQL..."
for i in $(seq 1 15); do
  PGPASSWORD=petpassword psql -h localhost -U petuser -d petradar_db -c "SELECT 1" 2>/dev/null && break
  sleep 2
done
echo "✅ PostgreSQL listo"

# 5. Verificar si hay datos o sembrar
TABLE_COUNT=$(PGPASSWORD=petpassword psql -h localhost -U petuser -d petradar_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'" 2>/dev/null | xargs)
PET_COUNT=$(PGPASSWORD=petpassword psql -h localhost -U petuser -d petradar_db -t -c "SELECT COUNT(*) FROM pets" 2>/dev/null | xargs)

if [ "$PET_COUNT" = "0" ] || [ -z "$PET_COUNT" ]; then
  echo "🌱 Sembrando datos de demostración..."
  cd "$PROJECT_DIR"
  node seed.js
else
  echo "📊 Datos existentes: $PET_COUNT mascotas (persistente ✅)"
fi

# 6. Iniciar API
echo "🚀 Iniciando API..."
cd "$PROJECT_DIR"
node dist/main.js
