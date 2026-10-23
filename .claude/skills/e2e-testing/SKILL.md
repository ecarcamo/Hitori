---
name: e2e-testing
description: Cómo escribir y depurar pruebas de punta a punta con Playwright en Hitori contra Supabase local, sin que sean inestables. Usar al crear o arreglar pruebas en e2e/ o cuando falle el job e2e de la CI.
---

# Pruebas de punta a punta

- Corren contra Supabase local (`npx supabase start`) y el servidor de desarrollo (Playwright lo levanta o reutiliza el 5173).
- Proyectos: `desktop` (Desktop Chrome) y `mobile` (Pixel 7). Usa `test.skip(({ isMobile }) => isMobile, '…')` cuando algo solo aplica a uno.
- Workers: 4 en local y 2 en la CI (`playwright.config.ts`); más paralelización ahoga el servidor de desarrollo.

## Ayudas

- `e2e/session.ts`: `uniqueEmail(label)` y `signUpAndOnboard(page, request, email)` (registro con el código leído de Mailpit y bienvenida).
- `e2e/mailpit.ts`: `readSignInCode(request, email)`.
- Para tener carriles rápido: `/settings/categories` → «Usar el ejemplo» (Estudios, Trabajo, Personal).

## Para que no sean inestables

- Busca por rol y nombre accesible; las tarjetas empiezan con su cuadrante y tienen un asa «Mover …»: usa `/^(?!Mover ).*Título/`.
- `role="status"` lo usan el aviso flotante y los anuncios de dnd-kit: busca avisos por texto (`getByText('Listo: …')`).
- Antes de arrastrar con mouse: `waitForLoadState('networkidle')` y esperar a que `document.getAnimations()` no tenga ninguna corriendo; luego mueve en pasos (`steps`).
- Tras cerrar un diálogo, espera a que desaparezca (`toBeHidden()`) antes de abrir otro.
- Teclado con dnd-kit: enfoca el asa, y deja ~150 ms entre `Space`, flechas y `Space`.
- Repite antes de dar por buena una prueba: `npx playwright test --repeat-each 3`.

## Reproducir una falla de la CI

1. `gh run view <id> --log-failed` y `gh run download <id> -n playwright-report`.
2. En `data/*.md` está la página en el momento del error; los `.zip` son trazas (`*-trace.trace`, JSON por línea) con cada acción y su tiempo.
3. Simula una máquina lenta en una copia temporal de la prueba:

```ts
test.beforeEach(async ({ page }) => {
  const session = await page.context().newCDPSession(page)
  await session.send('Emulation.setCPUThrottlingRate', { rate: 4 })
})
```

Confirma que la versión vieja falla y la nueva pasa antes de subir el arreglo.
