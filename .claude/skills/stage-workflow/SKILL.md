---
name: stage-workflow
description: Cómo se construye y entrega una etapa del plan de Hitori (docs/PLAN.md). Usar SIEMPRE al arrancar, continuar o cerrar una etapa o cualquier funcionalidad nueva del proyecto.
---

# Construir una etapa

## 1. Antes de escribir código

1. Lee la etapa en `docs/PLAN.md` (objetivo y «terminado cuando») y `.claude/MEMORY.md` (estado y pendientes).
2. Si hay diseño para esa pantalla, léelo del canvas «Hitori — pantallas» (página «D · Cuarto oscuro con temas», archivos `project/H-*.dc.html`, estilos en `project/v3/hitori-d.css` y `project/v3/temas.css`).
3. Actualiza `main` y crea la rama: `git checkout main && git pull && git checkout -b feat/<nn>-<tema>`.
4. Si la etapa necesita algo de la cuenta de Esteban (Cloudflare, Supabase, Resend, Google), pídeselo **paso a paso**, una pantalla a la vez, y nunca le pidas secretos por el chat: que los cargue él (`gh secret set …`, panel de Supabase).

## 2. Orden de construcción

1. **Base de datos** (si hace falta): skill `database-changes`.
2. **Dominio puro** en `src/features/<x>/domain/` con sus pruebas primero (Vitest). Casos borde de fechas siempre en la zona del perfil.
3. **Repositorio**: interfaz en `repositories/<x>Repository.ts` + implementación Supabase; errores traducidos a mensajes en español.
4. **Hooks** con TanStack Query (actualización optimista + `invalidateQueries` al final).
5. **Componentes** con CSS Modules sobre los tokens; reutiliza `src/shared/ui` (skill `ui-conventions`).
6. **Conexión**: agrega el repositorio a `RouterContext`/`AppDependencies`/`main.tsx`, la ruta en `src/app/router.tsx` y una vista en `src/app/routes/` que lea el contexto con `getRouteApi`.
7. **Repositorio falso** en `src/test/fakes.ts` para las pruebas de componentes.

## 3. Verificación (obligatoria antes del PR)

```bash
npm run check
npx supabase start && npm run test:e2e
npx playwright test --repeat-each 2
```

- E2E nuevo para el «terminado cuando» (skill `e2e-testing`).
- Revisión visual en el navegador integrado: escritorio 1440×900 y móvil 375×812, Templo oscuro y, si toca color, claro (skill `local-dev`). Corrige lo que se vea mal antes de abrir el PR.
- Revisa el tamaño del bundle (`npx vite build`); librerías pesadas → `advancedChunks` en `vite.config.ts` o `lazy()`.

## 4. Entrega

1. Commits pequeños por capa (`feat(<feature>): …`, `test(e2e): …`, `docs: …`).
2. PR con la skill `pull-requests`.
3. Actualiza `.claude/MEMORY.md` (estado, decisiones, trampas, pendientes) en el mismo PR.
4. Cuéntale a Esteban qué trae, cómo lo probaste y qué necesitas de él. **No hagas merge.**
5. Tras el merge: verifica la CI de `main` y que producción responda; borra la rama local.
