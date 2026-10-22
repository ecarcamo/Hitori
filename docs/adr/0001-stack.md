# ADR-0001 · Stack de Hitori

- **Estado:** aceptada
- **Fecha:** 22-oct-2026

## Contexto

Hitori es una app personal de kanban, web y PWA, detrás de un login. Debe costar cero, ser fácil de mantener por una sola persona y crecer por módulos (tablero, matriz, ahora, semana, calendarios).

## Decisión

- **Front:** Vite + React 19 + TypeScript estricto, publicado como archivos estáticos en Cloudflare Workers (`hitori.escudevwork.com`).
- **Backend:** Supabase (PostgreSQL + Auth + RLS + Edge Functions). No hay un servidor propio.
- **Datos en el cliente:** TanStack Router y TanStack Query; Zustand solo para estado de UI.
- **Estilos:** CSS Modules sobre tokens CSS del diseño «Cuarto oscuro».
- **Login sin contraseña:** código por correo (SMTP de Resend) y Google.
- **Calidad:** ESLint (typescript-eslint estricto, fronteras entre features con `import-x/no-restricted-paths`), Prettier, Vitest, Playwright, pgTAP y GitHub Actions.

## Consecuencias

- Un solo lenguaje (TypeScript) en el front y en las Edge Functions; SQL para el esquema y las políticas.
- La seguridad vive en la BD (RLS): el front nunca es la única barrera.
- Sin SSR: el SEO no importa porque todo está detrás del login.
- Si algún día hace falta un servidor, solo cambia la capa de repositorios.
