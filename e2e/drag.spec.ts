import { expect, test, type Locator, type Page } from '@playwright/test'
import { signUpAndOnboard, uniqueEmail } from './session'

async function createTask(page: Page, lane: string, title: string) {
  await page.getByRole('button', { name: `Agregar tarea a ${lane}` }).click()
  const panel = page.getByRole('dialog', { name: 'Nueva tarea' })
  await panel.getByLabel('Título').fill(title)
  await panel.getByRole('button', { name: 'Crear tarea' }).click()
  await expect(panel).toBeHidden()
}

async function dragWithMouse(page: Page, title: string, target: Locator) {
  await page.waitForLoadState('networkidle')
  const source = page.getByRole('button', { name: new RegExp(`^(?!Mover ).*${title}`) })
  const from = await source.first().boundingBox()
  if (!from) {
    throw new Error(`No se encontró la tarjeta ${title}`)
  }
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
  await page.mouse.down()
  await page.mouse.move(from.x + from.width / 2 + 12, from.y + from.height / 2, { steps: 4 })
  await expect(page.getByText(title, { exact: true })).toHaveCount(2)
  const to = await target.boundingBox()
  if (!to) {
    throw new Error('No se encontró dónde soltar')
  }
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 12 })
  await page.mouse.up()
}

test.skip(({ isMobile }) => isMobile, 'El arrastre se prueba en escritorio')

test('tasks move between columns and lanes with the mouse and stay there', async ({
  page,
  request,
}) => {
  await signUpAndOnboard(page, request, uniqueEmail('drag-mouse'))
  await page.goto('/settings/categories')
  await page.getByRole('button', { name: 'Usar el ejemplo' }).click()
  await expect(page.getByRole('region', { name: 'Personal' })).toBeVisible()
  await page.goto('/board')
  await createTask(page, 'Estudios', 'Leer capítulo 4')
  await createTask(page, 'Estudios', 'Resumen del parcial')

  await dragWithMouse(
    page,
    'Leer capítulo 4',
    page.getByRole('list', { name: 'Trabajo · En curso' }),
  )
  await expect(page.getByRole('list', { name: 'Trabajo · En curso' })).toContainText(
    'Leer capítulo 4',
  )

  await dragWithMouse(
    page,
    'Resumen del parcial',
    page.getByRole('list', { name: 'Estudios · Hecho' }),
  )
  await expect(page.getByRole('list', { name: 'Estudios · Hecho' })).toContainText(
    'Resumen del parcial',
  )

  await page.reload()
  await expect(page.getByRole('list', { name: 'Trabajo · En curso' })).toContainText(
    'Leer capítulo 4',
  )
  await expect(page.getByRole('list', { name: 'Estudios · Hecho' })).toContainText(
    'Resumen del parcial',
  )
})

test('tasks reorder and move with the keyboard', async ({ page, request }) => {
  await signUpAndOnboard(page, request, uniqueEmail('drag-keyboard'))
  await page.goto('/settings/categories')
  await page.getByRole('button', { name: 'Usar el ejemplo' }).click()
  await expect(page.getByRole('region', { name: 'Personal' })).toBeVisible()
  await page.goto('/board')
  await createTask(page, 'Estudios', 'Primera')
  await createTask(page, 'Estudios', 'Segunda')

  const todo = page.getByRole('list', { name: 'Estudios · Por hacer' })
  await expect(todo.getByRole('button', { name: /^(?!Mover ).*(Primera|Segunda)/ })).toHaveText([
    /Primera/,
    /Segunda/,
  ])

  await page.getByRole('button', { name: 'Mover Segunda' }).focus()
  for (const key of ['Space', 'ArrowUp', 'Space']) {
    await page.keyboard.press(key)
    await page.waitForTimeout(150)
  }
  await expect(todo.getByRole('button', { name: /^(?!Mover ).*(Primera|Segunda)/ })).toHaveText([
    /Segunda/,
    /Primera/,
  ])

  await page.reload()
  await expect(todo.getByRole('button', { name: /^(?!Mover ).*(Primera|Segunda)/ })).toHaveText([
    /Segunda/,
    /Primera/,
  ])

  for (const title of ['Segunda', 'Primera']) {
    await page.getByRole('button', { name: `Mover ${title}` }).focus()
    for (const key of ['Space', 'ArrowRight', 'Space']) {
      await page.keyboard.press(key)
      await page.waitForTimeout(150)
    }
    await expect(page.getByRole('list', { name: 'Estudios · En curso' })).toContainText(title)
  }
  await expect(page.getByRole('list', { name: 'Estudios · Por hacer' })).toContainText(
    'Nada por hacer',
  )
})
