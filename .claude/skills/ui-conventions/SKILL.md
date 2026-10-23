---
name: ui-conventions
description: Sistema visual de Hitori (dirección «Cuarto oscuro», 5 temas × claro/oscuro), componentes compartidos y trampas de la interfaz. Usar al crear o cambiar cualquier pantalla o componente.
---

# Interfaz de Hitori

## Tokens

- Temas en `src/shared/styles/themes.css`: `templo` (por defecto), `ronin`, `verde`, `acero`, `mostaza`, cada uno en `dark` y `light`. Se aplican con `data-theme` y `data-mode` en `<html>` (o en cualquier elemento, para vistas previas).
- Roles: `--ground` (fondo) → `--dim` → `--lit` → `--lit2` (la jerarquía es un paso de tono, sin bordes ni sombras en reposo), `--ink`, `--muted`, `--faint`, `--accent`, `--on-accent`, `--accent-text`, `--cat-1…8` (tonos de categoría), `--scrim`.
- Dentro de una superficie `--lit` (panel abierto), los controles van en `--lit2` para que se distingan.
- Tipografía: Schibsted Grotesk (incluida en el build). Títulos de página 72 px (44 px en móvil).
- Móvil por debajo de 768 px: barra de pestañas abajo, contenido con `padding-bottom` para no quedar tapado.

## Componentes compartidos (`src/shared/ui`)

`Button` (accent, default, ghost; sm, md, lg) · `SegmentedControl` (`fullWidth`) · `TextField` · `TextAreaField` · `SelectField` · `Switch` · `Chip` / `ChipInput` · `CategoryDot` · `QuadrantGlyph` · `WipMeter` · `BrandMark` · `Icon` · `IconButton` · `PageHeader` · `EmptyState` · `Divider` · `SidePanel` · `Modal` · `ComingSoonDialog` · `showToast` + `ToastHost` · `useRovingRadioGroup`.

Antes de crear un componente nuevo, revisa si alguno de estos sirve o se puede extender.

## Reglas

- Lo que todavía no existe abre `ComingSoonDialog`, nunca un botón roto o deshabilitado sin explicación.
- Todo lo flotante (diálogos, overlays de arrastre, avisos) va en un **portal a `document.body`**: el contenedor de la página tiene `transform` por la animación de entrada y rompe `position: fixed`.
- Para enfocar un campo al abrir un diálogo: atributo `data-autofocus` (lo usan `SidePanel` y `Modal`); si el contenido se carga con `lazy()`, enfócalo en un `useEffect` del propio componente.
- Animaciones con Motion (`m.div` dentro de `LazyMotion`) o CSS; siempre respetando `prefers-reduced-motion`.
- Accesibilidad: roles reales, `aria-label` en botones de solo ícono, foco visible, objetivos ≥ 44 px, radios con flechas (`useRovingRadioGroup`).
- Texto visible en español; identificadores y rutas en inglés.
- Nada de colores sueltos: solo variables del tema.
- Las tarjetas arrastrables llevan `user-select: none`.

## Verificación

Revisa cada pantalla tocada en escritorio y móvil, en oscuro y claro, con el navegador integrado (skill `local-dev`) y corrige contraste, desbordes y barras de scroll nativas antes del PR.
