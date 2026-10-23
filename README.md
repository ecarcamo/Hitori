# Hitori

Kanban personal, muy visual: **tu tablero, a tu ritmo.**

Web para la compu y PWA para el teléfono. Carriles por categoría, límite de tareas en curso, matriz de Eisenhower con urgencia derivada de la fecha, vista «Ahora» y calendarización.

- Plan de construcción: [`docs/PLAN.md`](docs/PLAN.md)
- Decisiones de arquitectura: [`docs/adr/`](docs/adr)
- Base de datos: [`docs/database.md`](docs/database.md)
- Inicio de sesión: [`docs/auth.md`](docs/auth.md)

## Requisitos

- Node 24 o superior (`.nvmrc`)
- Docker y la [CLI de Supabase](https://supabase.com/docs/guides/cli), para la base de datos local

## Empezar

```bash
npm install
npx supabase start
npm run dev
```

`.env.development` apunta al Supabase local y `.env.production` al de producción; las dos claves son públicas por diseño. Para cambiar algo solo en tu máquina, usa `.env.development.local`.

El buzón de prueba local, donde llegan los códigos para entrar, está en <http://127.0.0.1:55324>.

## Comandos

| Comando             | Qué hace                                      |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Servidor de desarrollo                        |
| `npm run build`     | Build de producción en `dist/`                |
| `npm run typecheck` | Revisión de tipos                             |
| `npm run lint`      | ESLint (incluye las fronteras entre features) |
| `npm run format`    | Formatea con Prettier                         |
| `npm run test`      | Pruebas con Vitest                            |
| `npm run check`     | Todo lo anterior, igual que la CI             |
| `npm run test:e2e`  | Pruebas de punta a punta con Playwright       |
| `npm run db:start`  | Levanta la base de datos local                |
| `npm run db:test`   | Pruebas de la base de datos (pgTAP)           |
| `npm run db:types`  | Regenera los tipos de la base de datos        |

Al hacer commit, `lint-staged` corre ESLint y Prettier sobre los archivos cambiados.

## Estructura

```
src/
├── app/          arranque, router, layout
├── features/     una carpeta por módulo: domain/ repositories/ hooks/ components/ + index.ts
└── shared/       ui/ lib/ styles/ — no depende de features ni de app
supabase/         migraciones, Edge Functions, pruebas pgTAP
docs/             plan y ADRs
```

Reglas de dependencia (las revisa ESLint):

- Una feature se importa desde otra solo por su `index.ts`.
- `shared/` no importa de `features/` ni de `app/`.
- Las features no importan de `app/`.

## Convenciones

- Identificadores y commits en inglés; todo texto visible en español.
- Sin comentarios en el código: los nombres explican.
- Las reglas del negocio son funciones puras en `domain/`, siempre con prueba.
- Lo que todavía no existe nunca es un botón roto ni deshabilitado sin explicación: abre `ComingSoonDialog` («Muy pronto») con lo que viene y qué hacer mientras tanto.
- Commits con [Conventional Commits](https://www.conventionalcommits.org/): `feat(board): …`, `fix(capture): …`.
- Una rama y un PR por etapa; `main` solo recibe PRs con la CI en verde y se fusiona con squash.
- Todo PR con cambios visuales lleva capturas (escritorio y móvil) y todo PR con cambios de lógica lleva un diagrama en Mermaid: ver [`docs/pull-requests.md`](docs/pull-requests.md).
- Todo PR se asigna a @ecarcamo y lleva su label: `enhancement` (funcionalidad), `infra` (despliegue y configuración), `documentation`, `bug` o `dependencies`.

## Despliegue

- Producción: <https://hitori.escudevwork.com>, publicada por Cloudflare Workers en cada merge a `main`.
- Cada PR recibe una URL de vista previa en `*-hitori.estebancarcamou.workers.dev`.
