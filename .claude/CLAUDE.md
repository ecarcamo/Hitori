# Hitori

Kanban personal (web + PWA) de Esteban Cárcamo (@ecarcamo). Producción: <https://hitori.escudevwork.com>. Repo: <https://github.com/ecarcamo/Hitori> (público).

Responde siempre en **español**, con ortografía cuidada. Ve **paso a paso**: una etapa del plan por PR y no abras la siguiente hasta que la anterior esté fusionada. Todo debe quedar en **capas gratuitas** (es un proyecto personal).

Lee antes de trabajar:

- `docs/PLAN.md`: etapas, objetivo y «terminado cuando» de cada una.
- `.claude/MEMORY.md`: lo que ya se hizo, decisiones y pendientes. **Actualízalo al cerrar cada PR.**
- `docs/database.md`, `docs/auth.md`, `docs/capture.md`, `docs/pull-requests.md`.

@MEMORY.md

## Stack

Vite 8 + React 19 + TypeScript 6 estricto · TanStack Router (rutas tipadas, contexto con repositorios) · TanStack Query (optimista) · Zustand (solo estado de UI) · CSS Modules sobre tokens CSS · Motion (`motion/react-m` + `LazyMotion`) · dnd-kit · zod/mini · date-fns + `@date-fns/tz` · chrono-node (es) · Supabase (Postgres + Auth + RLS, sin servidor propio) · Cloudflare Workers (solo assets estáticos) · Vitest + Testing Library · Playwright · pgTAP.

## Arquitectura

```
src/app/        router, layout (AppShell, Sidebar, TabBar), vistas de ruta (routes/*View.tsx)
src/features/X/ domain/ (puro) · repositories/ (interfaz + Supabase) · hooks/ · components/ · state/ · index.ts
src/shared/     ui/ (componentes) · lib/ (helpers) · styles/ (tokens de los 5 temas)
supabase/       migrations/ · tests/database/ (pgTAP) · seed.sql · templates/
e2e/            Playwright contra Supabase local
```

- Dependencias: `components → hooks → repositories → supabase`; todos pueden usar `domain/`. Solo los repositorios conocen Supabase.
- Una feature importa otra **solo por su `index.ts`**; `shared/` no importa de `features/` ni de `app/`. Lo revisa ESLint (`import-x/no-restricted-paths`).
- Los repositorios se inyectan por el contexto del router (`RouterContext`) y las vistas de `app/routes` los pasan como props a las páginas de cada feature.
- Las reglas del negocio son funciones puras en `domain/` y siempre llevan pruebas.

## Reglas de código (obligatorias)

1. Identificadores, commits y **URLs en inglés**; todo texto visible en **español**.
2. **Cero comentarios** en el código.
3. Funciones de componente ≤ 150 líneas (ESLint lo exige); extrae subcomponentes.
4. Sin `any`, sin aserciones innecesarias; TypeScript estricto (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).
5. Constantes con nombre, nada de números mágicos.
6. Tipos de la BD generados (`npm run db:types`), nunca a mano.
7. Accesible: botones reales, foco visible, objetivos ≥ 44 px, contraste del tema.
8. Nada de controles con aspecto nativo del navegador sin estilo.
9. Lo que aún no existe abre `ComingSoonDialog` («Muy pronto»); nunca un botón roto o deshabilitado sin explicación.
10. Commits en Conventional Commits, sin pies de atribución ni menciones de IA.

## Comandos

```bash
npx supabase start      # Supabase local en puertos 553xx (convive con otros proyectos)
npm run dev             # http://localhost:5173
npm run check           # tipos + lint + formato + pruebas + build (igual que la CI)
npm run test:e2e        # Playwright (necesita Supabase local)
npm run db:reset        # recrea la BD con migraciones + seed
npm run db:test         # pgTAP
npm run db:types        # regenera src/shared/lib/database.types.ts
```

Usuario local: `dev@hitori.test`; el código de 6 dígitos llega a Mailpit en <http://127.0.0.1:55324>.

## Flujo de trabajo

Usa las skills de `.claude/skills/`:

- `stage-workflow`: cómo se construye y entrega una etapa del plan.
- `pull-requests`: rama, commits, asignación, label y evidencia (capturas o diagrama).
- `database-changes`: migraciones, RLS, pgTAP y despliegue de la BD.
- `e2e-testing`: pruebas de Playwright estables.
- `ui-conventions`: tokens, componentes compartidos y trampas de la interfaz.
- `local-dev`: levantar todo en local y revisar en el navegador.
- `production-ops`: Cloudflare, Supabase, Resend y secretos.

`main` está protegida: solo entra por PR con `check`, `database` y `e2e` en verde, merge con squash, y la rama se borra sola. **El merge lo hace Esteban**, nunca tú.
