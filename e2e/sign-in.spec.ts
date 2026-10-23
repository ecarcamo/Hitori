import { expect, test } from '@playwright/test'
import { readSignInCode } from './mailpit'

test('a new person signs in with an emailed code, finishes the onboarding and signs out', async ({
  page,
  request,
}, testInfo) => {
  const email = `e2e-${testInfo.project.name}-${String(Date.now())}@hitori.test`

  await page.goto('/board')
  await expect(page).toHaveURL(/\/sign-in\?redirect=%2Fboard/)

  await page.getByLabel('Tu correo').fill(email)
  await page.getByRole('button', { name: 'Recibir código' }).click()
  await expect(page.getByText(email)).toBeVisible()

  await page.getByLabel('Código').fill(await readSignInCode(request, email))

  await expect(page).toHaveURL(/\/welcome/)
  await page.getByLabel('¿Cómo te llamamos?').fill('Prueba')
  await expect(page.getByLabel('Tu zona horaria')).toHaveValue('America/Guatemala')
  await page.getByRole('button', { name: 'Empezar' }).click()

  await expect(page.getByRole('heading', { level: 1, name: 'Ahora' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'Ahora' })).toBeVisible()

  await page.goto('/settings/account')
  await expect(page.getByText(`Entraste como ${email}.`)).toBeVisible()
  await page.getByRole('button', { name: 'Cerrar sesión' }).click()

  await expect(page).toHaveURL(/\/sign-in/)
  await page.goto('/now')
  await expect(page).toHaveURL(/\/sign-in/)
})

test('old Spanish links still work', async ({ page }) => {
  await page.goto('/tablero')
  await expect(page).toHaveURL(/\/sign-in\?redirect=%2Fboard/)
})

test('a wrong code is explained without signing in', async ({ page }, testInfo) => {
  const email = `e2e-wrong-${testInfo.project.name}-${String(Date.now())}@hitori.test`

  await page.goto('/sign-in')
  await page.getByLabel('Tu correo').fill(email)
  await page.getByRole('button', { name: 'Recibir código' }).click()
  await page.getByLabel('Código').fill('000000')

  await expect(page.getByRole('alert')).toContainText('El código no es correcto')
  await expect(page).toHaveURL(/\/sign-in/)
})
