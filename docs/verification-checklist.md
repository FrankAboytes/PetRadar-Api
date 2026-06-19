# PetRadar Pro — Checklist de Verificación

## 📋 Cómo verificar cada punto del PDF

---

### 1. 📄 Test Plan
**Archivo**: `docs/test-plan.md`

```bash
cat ~/Documentos/Universidad/8toSemestre/Calidad\ de\ software/petradar-api/docs/test-plan.md
```
**Qué verificar**: 13 secciones completas (alcance, estrategia, tipos de prueba, criterios, métricas, riesgos)

---

### 2. 🐛 Reporte de Bugs
**Archivo**: `docs/bug-reports.md`

```bash
cat ~/Documentos/Universidad/8toSemestre/Calidad\ de\ software/petradar-api/docs/bug-reports.md
```
**Qué verificar**: 5 bugs con título, severidad, pasos, evidencia, estado (fixed)

---

### 3. 🧪 Unit Tests
**Archivo**: `src/auth/__tests__/auth.service.spec.ts`

```bash
cd ~/Documentos/Universidad/8toSemestre/Calidad\ de\ software/petradar-api
npm test
```
**Qué verificar**: 8 tests pasan (AAA pattern), output verde

---

### 4. 🏎️ Cypress (E2E)
**Archivo**: `petradar-frontend/cypress/e2e/petradar.cy.js`

```bash
# Requiere backend + frontend corriendo
cd ~/Documentos/Universidad/8toSemestre/Calidad\ de\ software/petradar-frontend
npx cypress run --headless
```
**Qué verifica**: Login, registro mascota, reportar pérdida/encontrada, dashboard stats

---

### 5. ⚡ JMeter (Rendimiento)
**Archivo**: `docs/jmeter-test-plan.jmx`

```bash
# Requiere JMeter instalado
cd ~/Documentos/Universidad/8toSemestre/Calidad\ de\ software/petradar-api/docs
jmeter -n -t jmeter-test-plan.jmx -l resultados.jtl
```
**Qué verifica**: 20 logins concurrentes, 50 búsquedas geográficas, tiempos de respuesta

---

### 6. 🛡️ OWASP (Seguridad)
**Guía**: `docs/owasp-zap-scan.md`

```bash
# Escaneo pasivo ZAP
zap-cli quick-scan -s xss,sqli --spider http://localhost:5173
```
**Qué verifica**: SQLi, XSS, headers de seguridad, rate limiting

---

### 7. 📝 Logging 5 niveles
**Archivo**: `src/common/logger.service.ts`

```bash
# Ver archivo de log
cat ~/Documentos/Universidad/8toSemestre/Calidad\ de\ software/petradar-api/logs/app-combined.log

# Ver logs de errores
cat ~/Documentos/Universidad/8toSemestre/Calidad\ de\ software/petradar-api/logs/app-error.log
```
**Qué verifica**: `error`, `warn`, `info`, `debug`, `verbose` — formato JSON, sin passwords

---

### 8. 📊 Dashboard
**URL**: `http://localhost:5173/`

```bash
# Login y ver dashboard
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@email.com","password":"TestPass123!"}'
```
**Qué verifica**: Cards con stats de mascotas, pérdidas, encontradas — todo funcional

---

### 9. 🔗 Correlation ID
**Middleware**: `src/common/correlation.middleware.ts`

```bash
# Verificar correlation ID en respuesta
curl -sI http://localhost:3000/health | grep x-correlation-id
```
**Qué verifica**: Cada request tiene `x-correlation-id` único, rastreable en logs

---

### 10. 🏗️ Arquitectura
**Stack**: TypeScript + REST API + PostgreSQL + MongoDB

```bash
# Ver entidades SQL (9 tablas)
ls ~/Documentos/Universidad/8toSemestre/Calidad\ de\ software/petradar-api/src/*/entity*.ts

# Ver schemas NoSQL (3 colecciones)
ls ~/Documentos/Universidad/8toSemestre/Calidad\ de\ software/petradar-api/src/*/schema*.ts
```
**Qué verifica**: 12 fuentes de datos (9 SQL + 3 NoSQL)

---

## ✅ Resumen rápido

| # | Requisito | Cómo verifico | Comando |
|---|-----------|---------------|---------|
| 1 | Test Plan | Leer archivo | `cat docs/test-plan.md` |
| 2 | Bug Reports | Leer archivo | `cat docs/bug-reports.md` |
| 3 | Unit Tests | Correr tests | `npm test` |
| 4 | Cypress | Correr E2E | `npx cypress run --headless` |
| 5 | JMeter | Correr plan | `jmeter -n -t docs/jmeter-test-plan.jmx` |
| 6 | OWASP | Escanear | `zap-cli quick-scan http://localhost:3000` |
| 7 | Logs | Ver archivo | `cat logs/app-combined.log` |
| 8 | Dashboard | Abrir URL | `http://localhost:5173` |
| 9 | Correlation ID | Ver header | `curl -I localhost:3000/health` |
