import { expect, type APIRequestContext, type Page } from '@playwright/test'
import { readSignInCode } from './mailpit'

export function uniqueEmail(label: string) {
  return `e2e-${label}-${String(Date.now())}-${String(Math.round(Math.random() * 1e6))}@hitori.test`
}

export async function signUpAndOnboard(page: Page, request: APIRequestContext, email: string) {
  await page.goto('/entrar')
  await page.getByLabel('Tu correo').fill(email)
  await page.getByRole('button', { name: 'Recibir código' }).click()
  await page.getByLabel('Código').fill(await readSignInCode(request, email))
  await expect(page).toHaveURL(/\/bienvenida/)
  await page.getByLabel('¿Cómo te llamamos?').fill('Prueba')
  await page.getByRole('button', { name: 'Empezar' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Ahora' })).toBeVisible()
}
