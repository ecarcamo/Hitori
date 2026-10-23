---
name: local-dev
description: Levantar Hitori en local (Supabase en Docker, Vite, Mailpit), entrar con el usuario de prueba y revisar pantallas en el navegador integrado. Usar antes de probar a mano, tomar capturas o depurar algo en local.
---

# Desarrollo local

## Arrancar

```bash
npx supabase start        # Postgres, Auth, Mailpit… en puertos 553xx
npm run db:reset          # migraciones + seed (usuario dev@hitori.test con categorías y tareas)
npm run dev               # http://localhost:5173
```

- Los puertos 543xx los usa otro proyecto local (Sento): Hitori usa API 55321, DB 55322, Studio 55323, Mailpit 55324.
- `.env.development` apunta al Supabase local; para cambios solo tuyos usa `.env.development.local`.
- Docker debe estar corriendo.

## Entrar

1. En `/sign-in` escribe `dev@hitori.test` (o cualquier correo: se crea la cuenta).
2. Lee el código en Mailpit (<http://127.0.0.1:55324>) o con:

```bash
curl -s "http://127.0.0.1:55324/api/v1/search?query=to:%22dev@hitori.test%22&limit=1"
```

y luego `GET /api/v1/message/<ID>`; el código es el primer número de 6 dígitos del texto.

3. Si reinicias la base (`db:reset`), la sesión guardada en el navegador deja de valer: vuelve a entrar.

## Revisar en el navegador integrado

- `.claude/launch.json` define `hitori-dev` (`npm run dev -- --port 5173 --strictPort`); ábrelo con `preview_start`.
- Tamaños: `resize_window` 1440×900 (escritorio) y `preset: mobile` (375×812). Al terminar, `preset: desktop` y `preview_stop`.
- Cambiar tema o modo: `localStorage.setItem('hitori.appearance', JSON.stringify({ state: { theme: 'templo', mode: 'light' }, version: 0 }))` y recargar.
- `left_click_drag` no sirve para dnd-kit (salta sin pasos intermedios): usa el teclado sobre el asa «Mover …» o Playwright.
- Las capturas pueden ir unos segundos atrasadas respecto a las animaciones; comprueba el estado real con `javascript_tool`.
- Deja los datos de ejemplo como estaban con `npm run db:reset` cuando termines.
