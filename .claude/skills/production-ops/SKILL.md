---
name: production-ops
description: Operación de producción de Hitori — Cloudflare Workers, Supabase (proyecto hitori), Resend, secretos de GitHub y verificación después de cada merge. Usar al tocar despliegue, configuración de Auth, correo, dominios o secretos, o cuando algo falle en producción.
---

# Producción

| Pieza       | Dónde                                                                                        | Notas                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Front       | Cloudflare Worker `hitori` (`wrangler.jsonc`, solo assets)                                   | Deploy en cada merge a `main`; vista previa por PR en `*-hitori.estebancarcamou.workers.dev` |
| Dominio     | `hitori.escudevwork.com` (zona en Cloudflare)                                                | Custom domain del Worker                                                                     |
| BD y Auth   | Supabase `hitori`, ref `fcpcozlpjjegpthphpqm`, us-east-1, plan gratis                        | Se pausa tras ~7 días sin uso                                                                |
| Correo      | Resend, dominio `escudevwork.com` verificado                                                 | SMTP `smtp.resend.com:465`, usuario `resend`, remitente `no-reply@escudevwork.com`           |
| Secretos CI | `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD` (secrets); `SUPABASE_PROJECT_REF` (variable) | Los carga Esteban con `gh secret set`; nunca pasan por el chat                               |

## Reglas

- Todo en capas gratuitas.
- Nunca pidas ni escribas secretos en el chat, en archivos ni en commits. `.env.production` solo lleva la URL y la clave **publicable** (pública por diseño).
- Cambios en el panel de Supabase (Auth, SMTP, plantillas) se guían **paso a paso** con Esteban y se documentan en `docs/auth.md`.
- La plantilla del correo es `supabase/templates/sign-in-code.html`; si cambia, Esteban debe pegarla en «Confirm sign up» y «Magic link or OTP».
- Google OAuth está apagado (`VITE_GOOGLE_SIGN_IN`); al activarlo: cliente en Google Cloud, proveedor en Supabase y `VITE_GOOGLE_SIGN_IN=true` en `.env.production`.

## Después de cada merge

```bash
gh run list --branch main --limit 3
curl -s https://hitori.escudevwork.com/ | grep -o "<title>.*</title>"
```

- Si hubo migraciones: revisa el workflow «Deploy database» y, con las herramientas de Supabase, `list_migrations` y `get_advisors`.
- Si la CI de `main` falla después de un merge que en el PR pasó, normalmente es una prueba sensible a la velocidad: skill `e2e-testing`.
