---
name: pull-requests
description: Cómo se abre o actualiza un PR en Hitori. Usar SIEMPRE antes de `gh pr create` o de editar la descripción de un PR en este repo. Exige capturas (escritorio y móvil) si el cambio es visual y un diagrama Mermaid si el cambio es de lógica, además de asignar a ecarcamo y poner su label.
---

# PRs en Hitori

La regla completa está en `docs/pull-requests.md`. Resumen operativo:

## Siempre

- Rama `feat/…`, `fix/…`, `docs/…` o `chore/…`; nunca commits a `main` (está protegida).
- `npm run check` en verde y e2e en verde antes de abrir.
- `gh pr create --base main --assignee ecarcamo --label <label>` con `enhancement`, `infra`, `documentation`, `bug` o `dependencies`.
- Descripción en español con: Objetivo, Qué cambió, Cómo probarlo, Evidencia, Pruebas y, si es una etapa, «Terminado cuando».
- Sin pies de atribución ni menciones de IA en commits ni PRs.
- El merge lo hace Esteban.

## Evidencia

| Cambio | Evidencia                                                                                    |
| ------ | -------------------------------------------------------------------------------------------- |
| Visual | Capturas en escritorio 1440×900 y móvil 375×812 (Templo oscuro; también claro si toca color) |
| Lógica | Diagrama Mermaid (`erDiagram`, `sequenceDiagram`, `stateDiagram-v2` o `flowchart`)           |
| Ambos  | Las dos cosas                                                                                |

Capturas:

1. Tómalas con el navegador integrado (`preview_start` con `hitori-dev`). El resultado de cada captura trae la ruta del archivo `.jpg` en `tool-results/`.
2. Cópialas a la carpeta temporal con nombres claros (`tablero-escritorio.jpg`, `captura-movil.jpg`).
3. `scripts/publish-pr-assets.sh <rama> <archivos>` las sube a la rama `pr-assets` e imprime las URLs `raw.githubusercontent.com`.
4. Ponlas en tablas Markdown con un pie corto.

Las capturas del panel pueden salir con unos segundos de retraso respecto a las animaciones: espera, toma otra y, si dudas, comprueba el estado con JavaScript.

## Después

- Revisa la CI una vez (`gh pr checks <n>`); no la sondees en bucle.
- Si falla, lee el log (`gh run view <id> --log-failed`), baja el reporte de Playwright si hace falta (`gh run download <id> -n playwright-report`) y arréglalo en el mismo PR o en uno `fix/…` con label `bug`.
