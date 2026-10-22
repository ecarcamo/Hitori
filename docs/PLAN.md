# Hitori — Plan de construcción

> Plan vivo. Cada etapa tiene **un objetivo**, sus entregables y una condición de «terminado» que se puede comprobar.
> Una etapa no empieza hasta que la anterior está terminada, revisada y en `main`.

---

## 1. ¿Hace falta un backend aparte?

**No hace falta un servidor propio ni otro lenguaje.** Supabase ya es el backend:

| Necesidad                                | Quién la resuelve                                                                                                             |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Base de datos                            | PostgreSQL de Supabase                                                                                                        |
| API para leer y escribir tareas          | PostgREST (Supabase la genera sola a partir de las tablas) vía `supabase-js`                                                  |
| Que cada quien vea solo lo suyo          | **Row Level Security (RLS)**: políticas en la BD, `user_id = auth.uid()`                                                      |
| Login                                    | Supabase Auth, sin contraseñas: código de un solo uso por correo + Google                                                     |
| Reglas que no deben depender del cliente | Triggers y funciones SQL (`updated_at`, `completed_at`, crear perfil al registrarse)                                          |
| Lo que necesita secretos o correr solo   | **Supabase Edge Functions** (TypeScript/Deno): enviar push, resumen diario, OAuth de Google Calendar, sincronía, servidor MCP |
| Tareas programadas                       | `pg_cron` + `pg_net` llamando a las Edge Functions                                                                            |
| Secretos (tokens de calendario)          | Supabase Vault; la tabla no se expone al cliente                                                                              |

Resultado: **TypeScript de punta a punta** (React en el navegador, Deno en las Edge Functions) y **SQL** para el esquema y las políticas.
Si algún día hace falta un servidor de verdad (procesos largos, colas pesadas), se agrega sin tocar el front, porque el front habla con repositorios, no con Supabase directo (ver §3).

---

## 2. Stack

| Capa                | Elección                                                                         | Por qué                                                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Build               | **Vite** + **React 19** + **TypeScript** estricto                                | Es una app detrás de login: no necesita SSR. Sale como archivos estáticos, gratis de hospedar, y es lo más simple para PWA.                      |
| Rutas               | **TanStack Router**                                                              | Rutas y _search params_ tipados: los filtros viven en la URL y se conservan al cambiar de vista («mismas tareas, distinto lente»).               |
| Datos del servidor  | **TanStack Query**                                                               | Caché, actualizaciones optimistas al arrastrar tarjetas, reintentos, modo offline.                                                               |
| Estado de UI        | **Zustand** (solo lo que no es del servidor)                                     | Paleta abierta, carril activo en móvil, etc.                                                                                                     |
| Arrastrar y soltar  | **dnd-kit**                                                                      | Accesible (teclado), funciona con táctil, soporta varias listas (carriles × columnas).                                                           |
| Animación           | **Motion** (`motion/react`)                                                      | Entradas, reordenamiento con `layout`, hoja de captura en móvil; a 60 fps.                                                                       |
| Estilos             | **CSS Modules + tokens CSS**                                                     | El diseño ya está hecho con variables (`--ground`, `--lit`, `--accent`, `--cat-1…8`). Se portan tal cual: cero traducción, cero ruido de clases. |
| Validación          | **Zod**                                                                          | Valida formularios y lo que llega de la BD en los bordes.                                                                                        |
| Fechas              | **date-fns** v4 + `@date-fns/tz`                                                 | Todo se guarda en UTC; se muestra en la zona IANA del perfil.                                                                                    |
| Captura natural     | **chrono-node** (locale `es`) + parser propio para alias y `!`                   | «Entregar Tarea 6 IngSoft vie 8pm !»                                                                                                             |
| PWA                 | **vite-plugin-pwa** (Workbox)                                                    | Manifest, service worker, offline, _share target_.                                                                                               |
| Pruebas             | **Vitest** + Testing Library · **Playwright** (e2e) · **pgTAP** (RLS)            |                                                                                                                                                  |
| Calidad             | **ESLint** (typescript-eslint estricto) + **Prettier** + **lint-staged**         |                                                                                                                                                  |
| CI                  | **GitHub Actions**                                                               | Lint, tipos, pruebas, build y migraciones en cada PR.                                                                                            |
| Hospedaje del front | **Cloudflare Workers** (assets estáticos) en `hitori.escudevwork.com`            | Gratis: los archivos estáticos no tienen límite de peticiones; preview por PR; el dominio ya vive en Cloudflare.                                 |
| Correo de login     | **Resend** como SMTP de Supabase, enviando desde `escudevwork.com`               | El correo integrado de Supabase solo llega a miembros del equipo y manda ~2 por hora.                                                            |
| BD                  | **Supabase**: local con la CLI (Docker) + un proyecto en la nube para producción |                                                                                                                                                  |

---

## 3. Arquitectura

### Capas y regla de dependencia

```
components  ──►  hooks (TanStack Query)  ──►  repositories  ──►  supabase-js
     │                    │
     └──────────►  domain (TypeScript puro, sin React ni Supabase)  ◄──────┘
```

- **`domain/`**: reglas del negocio como funciones puras: urgencia, cuadrante de Eisenhower, días de atraso, «lista para hacer», ranking de «Ahora», límite en curso, parser de captura. Se prueba al 100 % sin navegador ni BD.
- **`repositories/`**: única capa que conoce Supabase. Traduce filas (`snake_case`) a modelos del dominio (`camelCase`). Cambiar de proveedor = cambiar solo esta capa.
- **`hooks/`**: `useTasks`, `useMoveTask`… envuelven repositorios con TanStack Query.
- **`components/`**: solo pintan y emiten eventos. No llaman a Supabase ni calculan reglas.

### Carpetas (por _feature_, no por tipo de archivo)

```
hitori/
├── src/
│   ├── app/                  # arranque: providers, router, layout (sidebar / tab bar)
│   ├── features/
│   │   ├── auth/
│   │   ├── tasks/            # domain/ repositories/ hooks/ components/
│   │   ├── board/
│   │   ├── capture/
│   │   ├── inbox/
│   │   ├── matrix/
│   │   ├── now/
│   │   ├── week/
│   │   ├── categories/
│   │   ├── appearance/
│   │   └── notifications/
│   ├── shared/
│   │   ├── ui/               # Pill, Segmented, Chip, Card, Dot, QuadrantGlyph, WipMeter, Switch, Sheet…
│   │   ├── lib/              # supabase client, fechas, zona horaria
│   │   └── styles/           # tokens.css (temas), reset, tipografía
│   └── main.tsx
├── supabase/
│   ├── migrations/           # SQL versionado, una migración por cambio
│   ├── functions/            # Edge Functions (Deno)
│   ├── tests/                # pgTAP
│   └── seed.sql
├── e2e/                      # Playwright
└── docs/
    ├── PLAN.md
    └── adr/                  # una decisión de arquitectura por archivo
```

Cada _feature_ expone una API pública por su `index.ts`; las demás _features_ importan solo de ahí (regla de ESLint).

---

## 4. Reglas de código

1. **Identificadores en inglés**; todo texto visible en **español**.
2. **Sin comentarios**: el nombre de la función dice qué hace; si hace falta un comentario, se renombra o se extrae una función.
3. Funciones cortas y con un solo propósito; componentes de menos de ~150 líneas.
4. TypeScript estricto (`strict`, `noUncheckedIndexedAccess`), prohibido `any`.
5. Nada de números mágicos: constantes con nombre (`DEFAULT_WIP_LIMIT = 3`).
6. Los tipos de la BD se generan (`supabase gen types`); nunca se escriben a mano.
7. Toda regla de negocio nueva entra con su prueba en `domain/`.
8. Accesible: botones reales, foco visible, todo tocable ≥ 44 px, contraste del diseño.
9. Commits con _Conventional Commits_ (`feat(board): …`), en inglés.
10. Pendientes y tareas del proyecto: en Notion, no en `TODO` dentro del código.

---

## 5. Ajustes propuestos al esquema (revisión del diagrama ER)

| #   | Tabla                                                                 | Cambio                                                                                              | Por qué                                                                                        |
| --- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 1   | `tasks`                                                               | `category_id` **nullable**                                                                          | Solo el título es obligatorio; una tarea sin categoría **es** la Bandeja.                      |
| 2   | `categories`                                                          | `color text` → `color_slot smallint` (1–8)                                                          | El diseño guarda uno de los 8 tonos del tema, no un hex: al cambiar de tema sigue legible.     |
| 3   | `categories`                                                          | `aliases text[]`                                                                                    | La captura rápida reconoce «IngSoft» → categoría/subcategoría. Mismo campo en `subcategories`. |
| 4   | `profiles`                                                            | `theme`, `color_mode` (`dark`/`light`/`system`), `custom_theme jsonb` (base + acento)               | Apariencia guardada por usuario y no por dispositivo.                                          |
| 5   | `subcategories`, `checklist_items`, `recurrence_rules`, `time_blocks` | agregar `user_id`                                                                                   | RLS simple y rápida (`user_id = auth.uid()`) en todas las tablas, sin _joins_.                 |
| 6   | `tasks`                                                               | `archived_at timestamptz`                                                                           | El cuadrante «Soltar» archiva sin borrar («Algún día»).                                        |
| 7   | `tasks`, `categories`, `checklist_items`                              | `sort_order` → `text` con _fractional indexing_                                                     | Reordenar al arrastrar escribe **una** fila, no reindexa la lista.                             |
| 8   | `calendar_connections`                                                | sin políticas para el cliente; tokens en Vault                                                      | Los tokens solo los lee la Edge Function con `service_role`.                                   |
| 9   | enums                                                                 | `task_status`: `todo`, `in_progress`, `waiting`, `done` · `task_context`, `energy_level` como enums | Valores cerrados, validados por la BD.                                                         |

La urgencia, el cuadrante y los días de atraso **no se guardan**: dependen de «ahora» y se calculan en `domain/`.

---

## 6. Entornos y despliegue

| Entorno    | Front                                                   | BD                                        | Cuándo se actualiza                                                                    |
| ---------- | ------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------- |
| Local      | `npm run dev`                                           | Supabase local (`supabase start`, Docker) | Siempre                                                                                |
| Preview    | Cloudflare Workers, una URL por PR                      | Supabase local en CI (pruebas)            | En cada PR                                                                             |
| Producción | Cloudflare Workers (`main`) en `hitori.escudevwork.com` | Proyecto Supabase en la nube              | Al hacer merge a `main`: CI aplica migraciones (`supabase db push`) y publica el front |

Secretos (claves de Supabase, VAPID, OAuth de Google) en _GitHub Secrets_ y en Supabase; nunca en el repo. `.env.example` documenta qué variables existen.

Ojo con la capa gratis de Supabase: pausa el proyecto tras ~7 días sin actividad. Con uso diario no pasa; si molesta, un ping programado lo evita.

## 7. Flujo de git

- `main` protegida: solo entra por PR con CI en verde.
- Una rama por etapa: `feat/01-design-system`, `feat/05-board`…
- PR pequeño con descripción: objetivo, qué cambió, cómo probarlo, capturas.
- Etiqueta de versión al cerrar cada fase (`v0.1.0` = MVP Fase 1).

---

## 8. Etapas

### Fase 1 — MVP usable en vivo

#### Etapa 0 · Cimientos del repositorio

**Objetivo:** un repo vacío pero profesional, donde cualquier cambio se valida solo.

- Vite + React + TS estricto, ESLint, Prettier, Vitest, lint-staged.
- Estructura de carpetas de §3 y regla de ESLint de fronteras entre _features_.
- GitHub Actions: `lint`, `typecheck`, `test`, `build`.
- README (cómo correrlo), `.env.example`, ADR-001 (stack).
  **Terminado cuando:** `npm run check` pasa en local y en CI; el primer PR muestra el check en verde.

#### Etapa 1 · Sistema de diseño en código

**Objetivo:** que la app se vea exactamente como el diseño «Cuarto oscuro», en los 5 temas × 2 modos, antes de tener datos.

- `tokens.css` portado de `temas.css`; Schibsted Grotesk; `ThemeProvider` (tema + modo + «según el sistema»).
- Componentes base en `shared/ui`: `Pill`, `Segmented`, `Chip`, `Card`, `CategoryDot`, `QuadrantGlyph`, `WipMeter`, `BrandMark`, `Switch`, `IconButton`, `Sheet`.
- _Shell_: barra lateral en escritorio, _tab bar_ en móvil (< 768 px), rutas vacías de Ahora, Tablero, Matriz, Semana, Bandeja, Ajustes.
- Despliegue del front en Cloudflare Workers con el subdominio `hitori.escudevwork.com`.
  **Terminado cuando:** la URL pública muestra el _shell_ navegable; las capturas en templo-oscuro y templo-claro coinciden con el diseño en escritorio y móvil.

#### Etapa 2 · Base de datos y seguridad

**Objetivo:** el esquema del MVP en Supabase, seguro por diseño y versionado.

- Migraciones: enums, `profiles`, `categories`, `subcategories`, `tasks`, `checklist_items`, `recurrence_rules`, `push_subscriptions` (con los ajustes de §5).
- RLS en todas las tablas; triggers: perfil al registrarse, `updated_at`, `completed_at` al pasar a `done`.
- Índices (`user_id, status`, `user_id, due_at`); `seed.sql` con datos de ejemplo.
- Tipos generados en `src/shared/lib/database.types.ts`.
- Pruebas pgTAP: un usuario **no puede** leer ni escribir datos de otro.
- Proyecto de producción creado y migraciones aplicadas desde CI.
  **Terminado cuando:** las pruebas de RLS pasan en CI y producción tiene el mismo esquema que local.

#### Etapa 3 · Autenticación y primer arranque

**Objetivo:** entrar a Hitori con una cuenta real y quedar listo para usarla.

- Login sin contraseña: código de 6 dígitos por correo (`signInWithOtp` + `verifyOtp`, plantilla con `{{ .Token }}`) y Google (Supabase Auth); rutas protegidas.
- SMTP propio con Resend (registros DNS en Cloudflare) y plantilla del correo en español con la marca de Hitori.
- Cliente OAuth de Google con permisos básicos (`openid`, `email`, `profile`), que no requieren verificación de Google.
- _Onboarding_: zona horaria detectada (editable), crear las primeras categorías o empezar vacío.
- Cerrar sesión, perfil básico.
  **Terminado cuando:** en producción se crea una cuenta, se cierra sesión y se vuelve a entrar; una prueba e2e cubre el flujo.

#### Etapa 4 · Categorías y subcategorías

**Objetivo:** cada usuario arma su propio mapa (pantalla «Categorías» del diseño).

- CRUD de categorías y subcategorías, tono 1–8, alias, «importante por defecto», días para urgente, límite en curso propio, archivar.
- Reordenar con arrastre.
  **Terminado cuando:** se puede recrear U / Trabajo / Internship / Personal con sus subcategorías y el orden se conserva al recargar.

#### Etapa 5 · Tareas y Tablero

**Objetivo:** el diferenciador: el tablero con carriles por categoría × columnas de estado, fluido y con límite en curso.

- `domain/tasks`: modelo, transiciones de estado, días de atraso, «lista para hacer», límite en curso (suave: avisa, no bloquea).
- Repositorio + hooks con actualizaciones optimistas.
- Tablero escritorio: carriles × 4 columnas, columna «En curso» encendida, arrastrar entre columnas y carriles (dnd-kit), teclado incluido.
- Tablero móvil: un carril a la vez (chips) y columnas como páginas con _snap_.
- Detalle de tarea (panel lateral / hoja): todos los campos, checklist, notas.
  **Terminado cuando:** se crean, editan, mueven y completan tareas en escritorio y móvil; mover a «En curso» con 3 ya en curso muestra el aviso; el dominio tiene sus pruebas.

#### Etapa 6 · Captura rápida y Bandeja

**Objetivo:** crear una tarea en menos de 5 segundos desde cualquier vista.

- `domain/capture`: parser (`chrono-node` es + alias + `!`), con pruebas de casos reales.
- `Ctrl/⌘ + K` en escritorio; hoja inferior en móvil mostrando lo que Hitori entendió, editable en chips.
- Bandeja: tareas sin categoría; triaje de una en una.
  **Terminado cuando:** «Entregar Tarea 6 IngSoft vie 8pm !» crea la tarea con categoría, fecha (zona del usuario) e importante; la bandeja se vacía con triaje.

> **Hito v0.1.0 — MVP en vivo.** Reemplaza el pizarrón de Notion para el uso diario.

### Fase 2 — Priorizar

#### Etapa 7 · Urgencia derivada y Matriz

**Objetivo:** la app decide qué es urgente; tú solo dices qué es importante.

- `domain/priority`: urgente = vence en ≤ N días (por categoría) o atrasada; cuadrante derivado.
- Vista Matriz (escritorio y móvil); arrastrar entre filas cambia «importante»; arrastrar a «urgente» pide fecha.
- Glifo de cuadrante en todas las tarjetas.
  **Terminado cuando:** cada tarea cae en el cuadrante correcto según su fecha e importancia, con pruebas de los bordes (vence hoy, vence en N días, sin fecha).

### Fase 3 — Qué toca ahora, en el teléfono

#### Etapa 8 · Vista Ahora

**Objetivo:** responder «¿qué hago ahora?» con 3 sugerencias.

- `domain/now`: filtro dónde → tiempo → energía → prioridad; ranking con pruebas.
- Chips excluyentes; «Empezar» mueve a En curso respetando el límite.
  **Terminado cuando:** con un set de tareas de prueba, el ranking devuelve las 3 esperadas para cada combinación de chips.

#### Etapa 9 · PWA

**Objetivo:** instalable en el teléfono y usable sin conexión.

- Manifest, íconos, _splash_, service worker; lectura offline de las tareas en caché.
- _Share target_: compartir texto desde el teléfono crea una tarea en la bandeja.
  **Terminado cuando:** Lighthouse marca la app como instalable y se instala en Android e iPhone.

#### Etapa 10 · Notificaciones push

**Objetivo:** el resumen diario y los avisos de vencimiento llegan solos.

- VAPID, registro en `push_subscriptions`, Edge Function `send-push`.
- `pg_cron` cada 15 min: resumen diario a la hora del perfil (en su zona) y avisos antes de vencer.
  **Terminado cuando:** llega el resumen diario a la hora configurada en Android y en iPhone con la PWA instalada (iOS ≥ 16.4).

#### Etapa 11 · Apariencia y tema propio

**Objetivo:** los 5 temas y crear uno propio con base + acento.

- Pantalla Apariencia; generador de roles en OKLCH que corrige tonos hasta cumplir contraste (texto 7:1, secundario 4.5:1, marcas 3:1), con pruebas.
- Se guarda en el perfil y viaja entre dispositivos.
  **Terminado cuando:** un tema creado con dos colores cualesquiera pasa todas las pruebas de contraste en claro y oscuro.

> **Hito v0.3.0** — listo para probarlo con ~5 personas antes de los calendarios.

### Fases 4 a 6 — Calendarios e integraciones (se detallan al llegar)

| Etapa                                         | Objetivo                                                                                                 |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 12 · Google Calendar: conexión                | OAuth en Edge Function, tokens en Vault, listar calendarios, elegir escribir/solo leer.                  |
| 13 · Reglas de ruteo y bloques                | Categoría → calendario; crear `time_blocks` como eventos (título real u «Ocupado»).                      |
| 14 · Vista Semana                             | Sin agendar a un lado, calendario unificado al otro, arrastrar para crear bloque, choques entre cuentas. |
| 15 · Sincronía de dos vías                    | _Push notifications_ de Google, `etag`, conflictos y borrados.                                           |
| 16 · Microsoft e iCloud                       | Graph (OAuth) y CalDAV.                                                                                  |
| 17 · MCP y voz                                | Servidor MCP remoto (`add_task`, `list_tasks`, `daily_briefing`…) y dictado con Web Speech API.          |
| 18 · Revisión semanal, Canvas y exportaciones | Progreso por categoría, importar ICS de Canvas, exportar a Markdown/Notion.                              |

---

## 9. Qué conviene validar con usuarios (antes de la Fase 4)

1. ¿El tablero en móvil se entiende con un carril a la vez?
2. ¿El glifo 2×2 del cuadrante se lee sin explicación?
3. ¿La captura natural acierta con las fechas en español que la gente escribe de verdad?
4. ¿Tres sugerencias en «Ahora» son suficientes o frustran?
