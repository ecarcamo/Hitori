# Captura rápida

Se abre con `Ctrl + K` (o `⌘ + K` en Mac), con «Nueva tarea» en la barra lateral o con el botón **+** del celular. Una línea basta; Hitori muestra lo que entendió antes de guardar y cada interpretación se puede quitar con su ×.

| Escribes                                      | Hitori entiende                                                     |
| --------------------------------------------- | ------------------------------------------------------------------- |
| `!`                                           | Importante                                                          |
| un alias (`ingsoft`)                          | La categoría o subcategoría con ese alias                           |
| `#nombre` (`#trabajo`, `#micasa`)             | La categoría o subcategoría con ese nombre (sin espacios ni tildes) |
| `vie 8pm`, `mañana a las 10`                  | Fecha y hora en tu zona horaria                                     |
| `el viernes`, `30 de octubre`                 | Ese día a las 23:59                                                 |
| `a las 8 de la noche`                         | 20:00                                                               |
| `30min`, `1h30`, `2 h`                        | Duración                                                            |
| `@casa`, `@compu`, `@u`, `@oficina`, `@calle` | Dónde                                                               |

Ejemplo: `Entregar Tarea 6 IngSoft vie 8pm !` → «Entregar Tarea 6» en U · Cursos, el viernes a las 20:00, importante.

- Sin categoría, la tarea va a la **Bandeja**; ahí se clasifica de una en una con «Clasificar».
- Si la categoría es «importante por defecto», la tarea sale importante aunque no lleve `!`.
- «Más detalles» abre el formulario completo con lo que ya se entendió.

El intérprete vive en `src/features/capture/domain/parseCapture.ts` y sus casos están en `parseCapture.test.ts`.
