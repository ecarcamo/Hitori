import { expect, test } from '@playwright/test'
import { signUpAndOnboard, uniqueEmail } from './session'

test('one line creates a task with its lane, date and importance', async ({
  page,
  request,
}, testInfo) => {
  await signUpAndOnboard(page, request, uniqueEmail(`capture-${testInfo.project.name}`))
  await page.goto('/settings/categories')
  await page.getByRole('button', { name: 'Usar el ejemplo' }).click()
  const studies = page.getByRole('region', { name: 'Estudios' })
  await studies.getByRole('button', { name: /^Estudios/ }).click()
  await studies.getByRole('button', { name: 'Agregar alias' }).click()
  await studies.getByLabel('Nuevo alias para Estudios').fill('IngSoft')
  await studies.getByLabel('Nuevo alias para Estudios').press('Enter')
  await expect(studies.getByText('ingsoft', { exact: true })).toBeVisible()

  await page.goto('/board')
  await expect(page.getByRole('heading', { level: 1, name: 'Tablero' })).toBeVisible()
  if (testInfo.project.name === 'mobile') {
    await page
      .getByRole('navigation', { name: 'Vistas' })
      .getByRole('button', { name: 'Nueva tarea' })
      .click()
  } else {
    await page.keyboard.press('ControlOrMeta+k')
  }
  const input = page.getByLabel('Qué hay que hacer')
  await expect(input).toBeFocused()
  await input.fill('Entregar Tarea 6 IngSoft vie 8pm !')

  const preview = page.getByRole('region', { name: 'Lo que entendió Hitori' })
  await expect(preview.getByText('Entregar Tarea 6', { exact: true })).toBeVisible()
  await expect(preview.getByText('Estudios', { exact: true })).toBeVisible()
  await expect(preview.getByText('Importante')).toBeVisible()
  await expect(preview.getByText(/20:00/)).toBeVisible()
  await input.press('Enter')

  await expect(page.getByText('Listo: «Entregar Tarea 6» está en Estudios.')).toBeVisible()
  await page.reload()
  const card = page
    .getByRole('list', { name: 'Estudios · Por hacer' })
    .getByRole('button', { name: /^(?!Mover ).*Entregar Tarea 6/ })
  await expect(card).toContainText('20:00')
  await card.click()
  const editor = page.getByRole('dialog', { name: 'Tarea' })
  await expect(editor.getByRole('switch', { name: 'Importante' })).toBeChecked()
  await expect(editor.getByLabel('Fecha límite')).toHaveValue(/T20:00$/)
})

test('captured tasks without a lane are triaged from the inbox', async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'El triaje se prueba en escritorio')
  await signUpAndOnboard(page, request, uniqueEmail('triage'))
  await page.goto('/settings/categories')
  await page.getByRole('button', { name: 'Usar el ejemplo' }).click()
  await expect(page.getByRole('region', { name: 'Personal' })).toBeVisible()

  for (const title of ['Idea para el blog', 'Comprar regalo']) {
    await page.keyboard.press('ControlOrMeta+k')
    await page.getByLabel('Qué hay que hacer').fill(title)
    await page.getByLabel('Qué hay que hacer').press('Enter')
    await expect(page.getByText(`Listo: «${title}» quedó en la Bandeja.`)).toBeVisible()
    await expect(page.getByLabel('Qué hay que hacer')).toBeHidden()
  }

  await page.goto('/inbox')
  await page.getByRole('button', { name: 'Clasificar' }).click()
  await expect(page.getByText('Quedan 2')).toBeVisible()
  await page.getByRole('button', { name: 'Trabajo' }).click()
  await expect(page.getByText('Queda 1')).toBeVisible()
  await page.getByRole('button', { name: 'Personal' }).click()
  await expect(page.getByRole('heading', { name: 'Listo: la Bandeja está vacía.' })).toBeVisible()

  await page.goto('/board')
  await expect(page.getByRole('list', { name: 'Trabajo · Por hacer' })).toContainText(
    'Idea para el blog',
  )
  await expect(page.getByRole('list', { name: 'Personal · Por hacer' })).toContainText(
    'Comprar regalo',
  )
})
