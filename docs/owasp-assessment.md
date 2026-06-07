# PetRadar Pro — OWASP Security Assessment

## Verificación de Seguridad vs OWASP Top 10

---

### A01 — Broken Access Control ✅

| Control | Estado | Evidencia |
|---------|--------|-----------|
| Roles TEACHER/STUDENT | ✅ | Implementado con guards |
| Confirmar encontrada solo dueño | ✅ | `ForbiddenException` si no es owner |
| Endpoints protegidos con JWT | ✅ | `@UseGuards(JwtAuthGuard)` en todos |

### A02 — Cryptographic Failures ✅

| Control | Estado | Evidencia |
|---------|--------|-----------|
| bcrypt para passwords | ✅ | 12 rounds via passlib |
| JWT con HS256 | ✅ | Firma segura, expiración configurable |
| No passwords en logs | ✅ | Logger sanitiza datos sensibles |
| No MD5/SHA1 | ✅ | Solo bcrypt + HS256 |

### A03 — Injection ✅

| Control | Estado | Evidencia |
|---------|--------|-----------|
| SQL Injection | ✅ | TypeORM con prepared statements |
| NoSQL Injection | ✅ | Mongoose con schemas tipados |
| XSS | ✅ | React JSX escapa automáticamente |

### A05 — Security Misconfiguration ✅

| Control | Estado |
|---------|--------|
| Helmet.js headers | ✅ |
| CORS restringido | ✅ |
| Sin stack traces en prod | ✅ |
| Rate limiting en login | ✅ (5 intentos/min) |

### A07 — Authentication Failures ✅

| Control | Estado |
|---------|--------|
| JWT con expiración | ✅ (configurable, default 8h) |
| Rate limiting login | ✅ |
| bcrypt password hashing | ✅ |
| Tokens con jti único | ✅ |

---

**Escaneo OWASP ZAP:** Pendiente para entorno de staging
**Snyk/npm audit:** Ejecutar antes de cada release
