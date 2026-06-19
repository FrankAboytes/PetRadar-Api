# PetRadar Pro — OWASP ZAP Escaneo

## 📋 Guía de verificación de seguridad con OWASP ZAP

### 1. Instalar OWASP ZAP

```bash
# Desde AUR (CachyOS)
yay -S zaproxy

# O descargar desde:
# https://www.zaproxy.org/download/
```

### 2. Iniciar el backend y frontend

```bash
# Terminal 1 - Backend
cd ~/Documentos/Universidad/8toSemestre/Calidad\ de\ software/petradar-api
npm run start:dev

# Terminal 2 - Frontend
cd ~/Documentos/Universidad/8toSemestre/Calidad\ de\ software/petradar-frontend
npm run dev
```

### 3. Modo Spider (rastreo pasivo)

```bash
# Escaneo pasivo de toda la aplicación
zap-cli quick-scan -s xss,sqli --spider http://localhost:5173
```

### 4. Escaneo activo

```bash
# Escaneo activo completo
zap-cli quick-scan -t http://localhost:3000 --active-scan
```

### 5. Escaneo de API (OpenAPI/Swagger)

```bash
# Si tenés Swagger en /api
zap-cli open-api-scan -t http://localhost:3000/api
```

### 6. Exportar resultados

```bash
zap-cli report -o ~/Documentos/DeepArmy/owasp-zap-report.html -f html
zap-cli report -o ~/Documentos/DeepArmy/owasp-zap-report.json -f json
```

### 7. Verificar vulnerabilidades comunes

```bash
zap-cli alerts --alert-risk High
zap-cli alerts --alert-risk Medium
```

---

## ✅ Checklist de seguridad verificable

| Vulnerabilidad | Cómo verificar |
|----------------|----------------|
| **SQL Injection** | ZAP detecta automáticamente en endpoints SQL |
| **XSS** | ZAP inyecta payloads en formularios |
| **JWT expuesto** | Verificar que /auth/login no retorne tokens en URL |
| **Rate limiting** | 20 requests rápidas a /auth/login deben fallar |
| **CORS** | `curl -H "Origin: https://evil.com" -I http://localhost:3000/pets` |
| **Headers seguridad** | `curl -I http://localhost:3000/health` debe tener helmet headers |

### Headers de seguridad esperados:

```bash
curl -sI http://localhost:3000/health | grep -iE "x-content-type-options|x-frame-options|x-xss-protection|strict-transport-security"
```

Salida esperada:
```
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
x-xss-protection: 1; mode=block
strict-transport-security: max-age=31536000; includeSubDomains
```

---

## 📊 Criterios de aceptación

| Nivel | Alertas máximas permitidas |
|-------|---------------------------|
| **High** | 0 (cero tolerancia) |
| **Medium** | ≤ 3 (justificadas) |
| **Low** | ≤ 10 (documentadas) |
