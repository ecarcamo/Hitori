# Cómo se abre un PR en Hitori

## Siempre

- Una rama por etapa o cambio (`feat/02-database`, `fix/...`, `docs/...`, `chore/...`); nunca commits directos a `main`.
- Commits en inglés con Conventional Commits, sin pies de atribución.
- `npm run check` en verde antes de abrir el PR.
- `gh pr create --assignee ecarcamo --label <label>`, con el label que corresponda: `enhancement`, `infra`, `documentation`, `bug` o `dependencies`.
- La descripción sigue la plantilla: Objetivo, Qué cambió, Cómo probarlo, Evidencia y, si es una etapa del plan, «Terminado cuando».
- El merge lo hace @ecarcamo.

## Evidencia obligatoria

| Si el PR…                                                                | Lleva                   |
| ------------------------------------------------------------------------ | ----------------------- |
| cambia algo que se ve (pantallas, estilos, componentes)                  | **capturas**            |
| cambia lógica (dominio, base de datos, políticas, flujos, integraciones) | **diagrama**            |
| hace las dos cosas                                                       | capturas **y** diagrama |
| solo toca configuración o documentación                                  | nada extra              |

### Capturas

1. Levanta la app (`npm run dev`) y abre cada pantalla que cambió.
2. Toma cada una en **escritorio 1440×900** y en **móvil 375×812**, con el tema por defecto (Templo oscuro). Si el cambio toca color o temas, agrega también el modo claro.
3. Ponles nombres claros: `tablero-escritorio.jpg`, `tablero-movil.jpg`.
4. Publícalas en la rama `pr-assets`, que no se mezcla con `main`:

   ```bash
   scripts/publish-pr-assets.sh <rama-del-pr> <archivo>...
   ```

   El script imprime una línea Markdown por imagen.

5. Pega esas líneas en la sección **Evidencia**, cada una con un pie corto («Tablero en móvil, Templo oscuro»).

### Diagrama

Va en la sección **Evidencia** como bloque `mermaid`, que GitHub dibuja solo. El tipo depende de lo que cambió:

- `erDiagram`: tablas y relaciones.
- `sequenceDiagram`: flujos entre la app, Supabase y servicios externos (login, push, calendario).
- `stateDiagram-v2`: estados, por ejemplo los de una tarea.
- `flowchart`: reglas y decisiones del dominio (urgencia, ranking de «Ahora»).

Un diagrama por idea, que se entienda sin leer el código y que use los mismos nombres que el código.
