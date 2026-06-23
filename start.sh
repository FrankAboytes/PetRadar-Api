#!/bin/bash
# Railway start script
echo "🐾 PetRadar Pro — Starting..."
echo "NODE_ENV=$NODE_ENV"
echo "PORT=$PORT"
echo "DATABASE_URL=${DATABASE_URL:0:30}..."
echo "MONGO_URL=${MONGO_URL:0:30}..."

node dist/main.js
