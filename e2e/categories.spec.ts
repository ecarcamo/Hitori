import { expect, test, type Page } from '@playwright/test'
import { signUpAndOnboard, uniqueEmail } from './session'

async function createCategory(page: Page, name: string, subcategories: string[] = []) {
  await page.getByRole('button', { name: 'Nueva categoría' }).click()
  await page.getByLabel('Nombre de la categoría').fill(name)
  await page.getByRole('button', { name: 'Crear categoría' }).click()
  const card = page.getByRole('region', { name })
  await expect(card.getByRole('button', { expanded: true })).toBeVisible()
  if (subcategories.length > 0) {
    await card.getByRole('button', { name: 'Agregar subcategoría' }).click()
  }
  for (const subcategory of subcategories) {
    await card.getByLabel(`Nueva subcategoría de ${name}`).fill(subcategory)
    await card.getByLabel(`Nueva subcategoría de ${name}`).press('Enter')
    await expect(card.getByText(subcategory, { exact: true })).toBeVisible()
  }
}

function laneNames(page: Page) {
  return page
    .locator('section[aria-label]')
    .evaluateAll((sections) => sections.map((section) => section.getAttribute('aria-label')))
}

test('a person recreates their lanes and the order survives a reload', async ({
  page,
  request,
}, testInfo) => {
  await signUpAndOnboard(page, request, uniqueEmail(`categories-${testInfo.project.name}`))
  await page.goto('/settings/categories')
  await expect(page.getByText('Todavía no tienes categorías')).toBeVisible()

  await createCategory(page, 'U', ['Cursos', 'Auxiliaturas'])
  await createCategory(page, 'Trabajo', ['Administrativo', 'Código'])
  await createCategory(page, 'Internship', ['Administrativo', 'Código'])
  await createCategory(page, 'Personal')

  const work = page.getByRole('region', { name: 'Trabajo' })
  await work.getByRole('button', { name: /^Trabajo/ }).click()
  await work.getByRole('button', { name: 'Agregar alias' }).click()
  await work.getByLabel('Nuevo alias para Trabajo').fill('Sento')
  await work.getByLabel('Nuevo alias para Trabajo').press('Enter')
  await expect(work.getByText('sento', { exact: true })).toBeVisible()

  await page
    .getByRole('region', { name: 'Personal' })
    .getByRole('button', { name: /^Personal/ })
    .click()
  await page
    .getByRole('region', { name: 'Personal' })
    .getByRole('button', { name: 'Subir' })
    .click()
  await expect.poll(() => laneNames(page)).toEqual(['U', 'Trabajo', 'Personal', 'Internship'])

  await page.reload()
  await expect.poll(() => laneNames(page)).toEqual(['U', 'Trabajo', 'Personal', 'Internship'])
  await expect(page.getByRole('region', { name: 'Trabajo' })).toContainText('alias: sento')
})

test('lanes can be reordered with the keyboard', async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'El arrastre con teclado se prueba en escritorio')
  await signUpAndOnboard(page, request, uniqueEmail('categories-keyboard'))
  await page.goto('/settings/categories')
  await page.getByRole('button', { name: 'Usar el ejemplo' }).click()
  await expect.poll(() => laneNames(page)).toEqual(['Estudios', 'Trabajo', 'Personal'])

  await page.getByRole('button', { name: 'Mover Personal' }).focus()
  for (const key of ['Space', 'ArrowUp', 'ArrowUp', 'Space']) {
    await page.keyboard.press(key)
    await page.waitForTimeout(150)
  }

  await expect.poll(() => laneNames(page)).toEqual(['Personal', 'Estudios', 'Trabajo'])
  await page.reload()
  await expect.poll(() => laneNames(page)).toEqual(['Personal', 'Estudios', 'Trabajo'])
})
