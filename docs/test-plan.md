# PetRadar Pro — Test Plan

## Plan de Pruebas de Software

**Versión**: 1.0  
**Proyecto**: PetRadar Pro — Gestión de Mascotas  
**Stack**: TypeScript + NestJS + PostgreSQL/PostGIS + MongoDB + React  
**Fecha**: Junio 2026

---

## 1. Introducción y Objetivos

PetRadar Pro es una aplicación web para el registro, búsqueda y recuperación de mascotas perdidas. El sistema permite a los usuarios reportar mascotas perdidas y encontradas, utilizando búsqueda geoespacial con PostGIS para emparejar automáticamente reportes cercanos (radio de 500m). Incluye chat entre usuarios, historial médico en MongoDB, y notificaciones push.

**Objetivos del plan de pruebas:**
- Validar que todos los endpoints REST funcionan correctamente
- Verificar la búsqueda geoespacial con PostGIS
- Asegurar que NoSQL (MongoDB) almacena y recupera datos correctamente
- Validar la seguridad JWT + bcrypt
- Probar la integración entre bases de datos relacional y no relacional

---

## 2. Alcance

### Dentro del alcance
- API REST: auth, pets, lost/found, health, location, notifications, chat
- Base de datos relacional: PostgreSQL + PostGIS (9 tablas)
- Base de datos NoSQL: MongoDB (3 colecciones)
- Frontend React: dashboard, formularios, mapas
- Autenticación JWT + bcrypt
- Búsqueda geoespacial ST_DWithin

### Fuera del alcance
- Infraestructura cloud (Railway)
- CDN y optimización de assets estáticos
- Traducción multi-idioma
- Aplicación móvil nativa

---

## 3. Estrategia de Prueba por Capa

| Capa | Tipo de Prueba | Herramienta | Cobertura Mínima |
|------|---------------|-------------|-----------------|
| **Unitaria (dominio)** | Unit | Vitest + Jest | 90% lógica de negocio |
| **Unitaria (servicios)** | Unit | Vitest + Jest | 80% servicios |
| **Integración (API)** | Integration | Supertest | 70% endpoints |
| **Integración (BD)** | Integration | TypeORM + Testcontainers | CRUD completo |
| **E2E (Frontend)** | End-to-End | Cypress | Flujos críticos |
| **Rendimiento** | Performance | k6/JMeter | Load/Stress/Spike |
| **Seguridad** | Security | OWASP ZAP + manual | OWASP Top 10 |

---

## 4. Tipos de Prueba

| Tipo | Justificación |
|------|--------------|
| **Unitarias** | Validar lógica de negocio pura (cálculos, validaciones) |
| **Integración** | Verificar comunicación entre módulos y bases de datos |
| **E2E** | Validar flujos completos desde el navegador |
| **Rendimiento** | Asegurar que la búsqueda geoespacial responde en <500ms |
| **Seguridad** | Proteger datos sensibles y endpoints |

---

## 5. Criterios de Entrada

- Código compilado sin errores (`npm run build`)
- Migraciones de base de datos aplicadas correctamente
- Docker containers de PostgreSQL y MongoDB funcionando
- Variables de entorno configuradas
- Seed data cargada

---

## 6. Criterios de Salida

- 90%+ cobertura en lógica de negocio
- 75%+ cobertura global
- 0 errores críticos/high abiertos
- Todos los E2E críticos pasando
- Búsqueda geoespacial responde en <500ms

---

## 7. Criterios de Suspensión

- Fallo en la conexión a bases de datos
- Error crítico que impide el flujo principal
- Dependencia externa (Railway/MongoDB Atlas) caída

---

## 8. Roles y Responsabilidades

| Rol | Persona | Responsabilidad |
|-----|---------|-----------------|
| QA Lead | Darko | Plan de pruebas, reportes, E2E |
| Developer | Darko | Unit tests, integración, corrección de bugs |

---

## 9. Entornos de Prueba

| Entorno | URL | BD | Propósito |
|---------|-----|----|-----------|
| **Local** | localhost:3000 | Docker local | Desarrollo y unit tests |
| **Staging** | — | Docker local | Pruebas de integración |
| **Producción** | Railway | Railway + Atlas | Validación final |

---

## 10. Herramientas

| Herramienta | Propósito | Justificación |
|-------------|-----------|--------------|
| **Vitest** | Unit tests | Rápido, compatible con TypeScript |
| **Supertest** | API tests | Pruebas HTTP directas |
| **Cypress** | E2E | Estándar industria, video + screenshots |
| **k6** | Rendimiento | Scriptable, CI-friendly |
| **OWASP ZAP** | Seguridad | Escaneo automático de vulnerabilidades |
| **Winston** | Logging | JSON estructurado, 5 niveles |
| **TypeORM** | ORM | Prepared statements, migrations |

---

## 11. Gestión de Defectos

### Flujo
```
New → Triage → In Progress → Fixed → Verified → Closed
```

### Severidades
| Severidad | Definición |
|-----------|-----------|
| **Critical** | Caída del sistema, pérdida de datos |
| **High** | Funcionalidad principal no funciona |
| **Medium** | Funcionalidad secundaria afectada |
| **Low** | Problema estético, mejora menor |

---

## 12. Métricas de Calidad

| Métrica | Objetivo |
|---------|----------|
| Cobertura global | ≥75% |
| Cobertura dominio | ≥90% |
| Defectos críticos | 0 en producción |
| Tasa de detección | >80% antes de prod |
| Tiempo de respuesta API | <500ms (p95) |
| Búsqueda geoespacial | <200ms |

---

## 13. Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| MongoDB Atlas caído | Baja | Alto | Fallback a MongoDB local |
| PostGIS query lenta | Media | Medio | Índices espaciales + explain |
| Dependencia externa Railway | Baja | Alto | Contenedores locales para test |
| Contraseñas en logs | Baja | Crítico | Winston filter + sanitización |
