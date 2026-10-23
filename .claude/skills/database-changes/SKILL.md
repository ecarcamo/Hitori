---
name: database-changes
description: Cambios de esquema en Hitori (Supabase/Postgres) — migraciones, políticas RLS, llaves compuestas, pruebas pgTAP, tipos generados y despliegue a producción. Usar SIEMPRE que se toque la base de datos.
---

# Cambios en la base de datos

`docs/database.md` describe el modelo. El esquema solo cambia con migraciones; nunca a mano en el panel.

## Pasos

1. `npx supabase migration new <nombre_en_ingles>` y escribe el SQL **sin comentarios**.
2. Reglas para tablas nuevas:
   - `user_id uuid not null default auth.uid()` y `unique (id, user_id)`.
   - Llaves foráneas **compuestas con `user_id`** hacia la tabla padre (así nadie apunta a datos ajenos).
   - `alter table … enable row level security;` y políticas `select/insert/update/delete` `to authenticated` con `user_id = (select auth.uid())`.
   - `revoke all … from anon, authenticated;` y luego `grant` solo lo necesario (columnas concretas si aplica).
   - `created_at`/`updated_at` con el trigger `private.set_updated_at()`.
   - Orden: `sort_order text collate "C" not null`.
   - Índices que cubran cada llave foránea y los filtros de RLS.
   - Funciones de trigger en el esquema `private`, `set search_path = ''`, `security definer` solo si es imprescindible.
3. `npm run db:reset` y agrega o ajusta pruebas en `supabase/tests/database/*.test.sql` (aislamiento entre usuarios, `anon` sin acceso, reglas e integridad). `npm run db:test`.
4. `npm run db:lint` y `npm run db:types` (el job `database` de la CI falla si los tipos no están al día).
5. Actualiza el seed (`supabase/seed.sql`) si conviene para desarrollo y `docs/database.md`.

## Producción

- Al hacer merge a `main`, el workflow «Deploy database» corre `supabase db push` (secretos `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`; variable `SUPABASE_PROJECT_REF`).
- Después del merge verifica con las herramientas de Supabase: `list_migrations`, `list_tables` y `get_advisors` (seguridad y rendimiento) del proyecto `fcpcozlpjjegpthphpqm`. Los avisos de «índice sin uso» son normales con poca data.
- Nunca apliques migraciones a producción a mano ni con `apply_migration`: rompe el historial que usa `db push`.
