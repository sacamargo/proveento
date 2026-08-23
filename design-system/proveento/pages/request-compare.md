# Request Compare Page Overrides

> **PROJECT:** Proveento
> **Generated:** 2026-08-23 01:57:19
> **Page Type:** General

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Layout Overrides

- **Max Width:** 1200px
- **Layout:** Comparación de propuestas a ciegas

### Spacing Overrides

- No overrides — use Master spacing

### Typography Overrides

- No overrides — use Master typography

### Color Overrides

- No overrides — use Master colors

### Component Overrides

- Nunca mostrar nombre, email o teléfono del proveedor si `status !== ACCEPTED`.
- Cards compactas con imagen y precio. El detalle abre en un Dialog, no en otra página.
- Si hay foto, el modal es ancho (hasta 72rem) y se lee como PDP: galería a la izquierda, detalle a la derecha.
- Si no hay foto, el modal es más angosto y no reserva espacio de galería.
- Confirmar antes de aceptar.

---

## Page-Specific Components

- Card de cotización ciega
- Modal de detalle
- Contacto revelado solo tras aceptar

---

## Recommendations

- Responsive: grid de cards en todos los anchos
- Forms: Show loading then success/error state
