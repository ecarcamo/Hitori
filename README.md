# Hitori

Kanban personal, muy visual: **tu tablero, a tu ritmo.**

Web para la compu y PWA para el teléfono. Carriles por categoría, límite de tareas en curso, matriz de Eisenhower con urgencia derivada de la fecha, vista «Ahora» y calendarización.

- Plan de construcción: [`docs/PLAN.md`](docs/PLAN.md)
- Decisiones de arquitectura: [`docs/adr/`](docs/adr)

## Requisitos

- Node 24 o superior (`.nvmrc`)
- Docker, para correr Supabase en local (a partir de la Etapa 2)

## Empezar

```bash
npm install
cp .env.example .env.local
npm run dev
```

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
- Commits con [Conventional Commits](https://www.conventionalcommits.org/): `feat(board): …`, `fix(capture): …`.
- Una rama y un PR por etapa; `main` solo recibe PRs con la CI en verde.
