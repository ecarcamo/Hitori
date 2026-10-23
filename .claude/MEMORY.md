# Memoria del proyecto

Registro vivo de lo hecho, las decisiones y lo pendiente. Se actualiza al cerrar cada PR (fecha en formato día-mes-año).

## Estado

| Etapa                                 | PR       | Estado                                      |
| ------------------------------------- | -------- | ------------------------------------------- |
| 0 · Cimientos del repo                | #1       | Hecha                                       |
| Config de Cloudflare Workers          | #5       | Hecha                                       |
| Convenciones de PR                    | #6, #8   | Hecha                                       |
| 1 · Sistema de diseño                 | #7       | Hecha                                       |
| 2 · Base de datos y seguridad         | #9       | Hecha                                       |
| 3 · Login sin contraseña y bienvenida | #10      | Hecha (probado en producción el 22-10-2026) |
| Aviso «Muy pronto»                    | #11      | Hecha                                       |
| 4 · Categorías y subcategorías        | #12      | Hecha                                       |
| 4b · URLs en inglés                   | #13      | Hecha                                       |
| 5a · Tareas y tablero                 | #14      | Hecha                                       |
| 5b · Arrastrar y soltar               | #15, #16 | Hecha                                       |
| 6 · Captura rápida y Bandeja          | este PR  | En revisión                                 |
| 6b · Servidor MCP                     | —        | Siguiente                                   |
| 7 en adelante                         | —        | Ver `docs/PLAN.md`                          |

## Decisiones

- **Sin backend propio:** Supabase (Postgres + Auth + RLS) y, cuando haga falta, Edge Functions en TypeScript.
- **Hosting:** Cloudflare Workers solo con assets estáticos (sin límite de peticiones en el plan gratis), dominio `hitori.escudevwork.com`.
- **Login:** código de 6 dígitos por correo (Supabase OTP + SMTP de Resend). Google queda **fuera del MVP**: el botón abre «Muy pronto»; se activa con `VITE_GOOGLE_SIGN_IN=true` cuando exista el cliente OAuth.
- **Datos:** `user_id` en todas las tablas, RLS `user_id = auth.uid()`, llaves foráneas compuestas con `user_id`, triggers en el esquema `private`. Fechas en UTC; zona IANA en el perfil.
- **Orden:** fractional indexing (`sort_order text collate "C"`); un movimiento escribe una fila.
- **Urgencia, cuadrante y atraso** no se guardan: se calculan en `domain/` con la zona del perfil.
- **Límite en curso** suave: avisa, no bloquea (global del perfil y propio por categoría).
- **Categorías:** tono 1–8 del tema (no hex), alias para la captura, archivar en vez de borrar.
- **Captura:** `!` importante, alias o `#nombre`, fechas con chrono-node en español, `30min`, `@lugar`; sin categoría → Bandeja.
- **MCP** (Etapa 6b): servidor remoto en una Edge Function con OAuth de Supabase; Hitori no paga ningún modelo.
- **URLs en inglés** (`/now`, `/board`, `/settings/...`); las viejas en español redirigen.
- **PRs:** asignados a @ecarcamo con label; capturas si es visual, diagrama Mermaid si es lógica (`scripts/publish-pr-assets.sh` sube las capturas a la rama `pr-assets`, que nunca se fusiona).

## Producción (ya configurado)

- Cloudflare Worker `hitori`, conectado al repo; deploy en cada merge a `main`, vista previa por PR.
- Supabase `hitori` (ref `fcpcozlpjjegpthphpqm`, us-east-1, plan gratis). Migraciones vía workflow «Deploy database» con los secretos `SUPABASE_ACCESS_TOKEN` (token de solo lectura del proyecto) y `SUPABASE_DB_PASSWORD`, y la variable `SUPABASE_PROJECT_REF`.
- Auth: Site URL y Redirect URLs, OTP de 6 dígitos y 600 s, plantillas «Confirm sign up» y «Magic link or OTP» con `supabase/templates/sign-in-code.html`, SMTP de Resend (dominio `escudevwork.com` verificado, remitente `no-reply@escudevwork.com`).
- `.env.production` lleva la URL y la clave publicable (públicas por diseño).

## Trampas aprendidas

- **`position: fixed` dentro de la página falla:** el contenedor animado por Motion tiene `transform`. Todo lo flotante (overlay de arrastre, avisos, diálogos) va en un portal a `document.body`.
- **dnd-kit:** el detector de colisiones es propio (`boardCollisionDetection`) y las flechas ← → usan `boardKeyboardCoordinates`; `closestCorners` mandaba la tarjeta a la columna equivocada. El teclado solo se activa desde el asa «Mover …».
- **Vite** recargaba la página al importar chrono-node por primera vez: está en `optimizeDeps.include`.
- **jsdom** no implementa `<dialog>`: `src/test/setup.ts` simula `showModal` y `close`.
- **Supabase local** usa puertos 553xx porque el proyecto de Sento ocupa los 543xx.
- **Proyectos nuevos de Supabase** traen OTP de 8 dígitos; hay que ponerlo en 6.
- **El correo integrado de Supabase** solo llega al equipo del proyecto: hace falta SMTP propio.
- **Playwright** con la paralelización máxima de una máquina de 32 núcleos ahogaba el servidor: 4 workers en local, 2 en la CI. Antes de arrastrar con mouse, esperar a que no haya animaciones.
- **El nombre accesible de una tarjeta empieza con su cuadrante** («Agendar …»); para buscarla usa `/^(?!Mover ).*Título/`.
- **TypeScript 7** todavía no lo soporta typescript-eslint: Dependabot lo ignora.

## Pendientes

- Probar en un teléfono real **mantener presionado para arrastrar** (el emulador manda eventos de mouse).
- UI para editar **alias de subcategorías** (hoy solo se usan los de la BD o `#nombre`).
- Selector de fecha propio (hoy usa el `datetime-local` del navegador).
- Cliente OAuth de Google (Etapa 17).
