# PetRadar Pro — Accesibilidad (WCAG 2.1)

## 📋 Checklist de verificación

### Imágenes (WCAG 1.1.1)
- [ ] Todas las imágenes tienen `alt` descriptivo
- [ ] Los iconos decorativos tienen `alt=""` (vacío)
- [ ] Las fotos de mascotas perdidas tienen `alt="Foto de [nombre], [especie] [color]"`

### Navegación por teclado (WCAG 2.1.1)
- [ ] Todos los botones son accesibles con Tab + Enter
- [ ] Los enlaces son accesibles con Tab
- [ ] Los formularios se pueden navegar con Tab en orden lógico
- [ ] No hay focus traps (no se queda atorado en un elemento)
- [ ] El botón de cerrar modal se puede activar con Escape

### Focus visible (WCAG 2.4.7)
- [ ] Todos los elementos interactivos tienen outline visible al hacer focus
- [ ] El focus no se pierde al cerrar modales

### Formularios (WCAG 3.3.2, 4.1.2)
- [ ] Todos los inputs tienen `<label>` asociado
- [ ] Los mensajes de error están vinculados con `aria-describedby`
- [ ] Los campos requeridos tienen `required` o `aria-required="true"`
- [ ] Los errores se anuncian con `role="alert"` o `aria-live="polite"`

### Contraste de color (WCAG 1.4.3)
- [ ] Texto normal: ratio de contraste ≥ 4.5:1
- [ ] Texto grande (≥18px o ≥14px bold): ratio ≥ 3:1

### Compatibilidad con lectores de pantalla
- [ ] Los landmarks HTML5 se usan correctamente (`<nav>`, `<main>`, `<footer>`)
- [ ] Los botones tienen texto descriptivo (no solo iconos)
- [ ] Los resultados dinámicos se anuncian con `aria-live`

---

## 🧪 Cómo verificar con axe-core (Cypress)

```javascript
// Instalar plugin
// npm install --save-dev cypress-axe

// En cypress/support/e2e.js:
import 'cypress-axe';

// En un test:
describe('Accesibilidad', () => {
  it('Login page should have no violations', () => {
    cy.visit('/login');
    cy.injectAxe();
    cy.checkA11y();
  });

  it('Dashboard page should have no violations', () => {
    cy.login('test@email.com', 'TestPass123!');
    cy.visit('/');
    cy.injectAxe();
    cy.checkA11y();
  });
});
```

### Pasos para instalar:

```bash
cd petradar-frontend
npm install --save-dev cypress-axe
```

Luego agregar en `cypress/support/e2e.js`:
```javascript
import 'cypress-axe';
```

Y en `cypress/e2e/accessibility.cy.js` correr los tests de accesibilidad.

---

## 📱 Pruebas de viewport (Responsive)

```bash
# Cypress tests para viewports
npx cypress run --config viewportWidth=1920,viewportHeight=1080
npx cypress run --config viewportWidth=768,viewportHeight=1024
npx cypress run --config viewportWidth=390,viewportHeight=844
```
