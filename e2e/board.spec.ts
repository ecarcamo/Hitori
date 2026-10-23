import { expect, test } from '@playwright/test'
import { signUpAndOnboard, uniqueEmail } from './session'

test('a person adds tasks, moves them through the board and keeps them after reloading', async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'El tablero de escritorio se prueba en escritorio')
  await signUpAndOnboard(page, request, uniqueEmail('board'))
  await page.goto('/settings/categories')
  await page.getByRole('button', { name: 'Usar el ejemplo' }).click()
  await expect(page.getByRole('region', { name: 'Estudios' })).toBeVisible()

  await page.goto('/board')
  await page.getByRole('button', { name: 'Agregar tarea a Estudios' }).click()
  const panel = page.getByRole('dialog', { name: 'Nueva tarea' })
  await expect(panel.getByLabel('Título')).toBeFocused()
  await panel.getByLabel('Título').fill('Entregar Tarea 6')
  await panel.getByLabel('Subcategoría').selectOption({ label: 'Tareas' })
  await panel.getByLabel('Fecha límite').fill('2030-05-10T20:00')
  await panel.getByRole('button', { name: 'Crear tarea' }).click()

  const todo = page.getByRole('list', { name: 'Estudios · Por hacer' })
  await expect(todo.getByRole('button', { name: /^(?!Mover ).*Entregar Tarea 6/ })).toContainText(
    'Tareas',
  )

  await todo.getByRole('button', { name: /^(?!Mover ).*Entregar Tarea 6/ }).click()
  const editor = page.getByRole('dialog', { name: 'Tarea' })
  await expect(editor.getByLabel('Fecha límite')).toHaveValue('2030-05-10T20:00')
  await editor.getByRole('radio', { name: 'En curso' }).click()
  await editor.getByLabel('Nuevo paso').fill('Leer el enunciado')
  await editor.getByLabel('Nuevo paso').press('Enter')
  await expect(editor.getByRole('checkbox', { name: 'Leer el enunciado' })).toBeVisible()
  await editor.getByRole('button', { name: 'Guardar cambios' }).click()

  const doing = page.getByRole('list', { name: 'Estudios · En curso' })
  await expect(doing.getByText('Entregar Tarea 6')).toBeVisible()
  await expect(page.getByRole('img', { name: '1 de 3 en curso' })).toBeVisible()

  await page.reload()
  await expect(doing.getByRole('button', { name: /^(?!Mover ).*Entregar Tarea 6/ })).toContainText(
    '0/1',
  )

  await doing.getByRole('button', { name: /^(?!Mover ).*Entregar Tarea 6/ }).click()
  await page.getByRole('dialog', { name: 'Tarea' }).getByRole('radio', { name: 'Hecho' }).click()
  await page
    .getByRole('dialog', { name: 'Tarea' })
    .getByRole('button', { name: 'Guardar cambios' })
    .click()
  await expect(
    page.getByRole('list', { name: 'Estudios · Hecho' }).getByText('Entregar Tarea 6'),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Nueva tarea' }).click()
  await page.getByRole('dialog', { name: 'Nueva tarea' }).getByLabel('Título').fill('Idea suelta')
  await page
    .getByRole('dialog', { name: 'Nueva tarea' })
    .getByRole('button', { name: 'Crear tarea' })
    .click()
  await expect(page.getByText('Hay 1 tarea sin categoría en la')).toBeVisible()
  await page.getByRole('link', { name: 'Bandeja', exact: true }).last().click()
  await expect(
    page.getByRole('list', { name: 'Tareas sin categoría' }).getByText('Idea suelta'),
  ).toBeVisible()
})

test('the board works on a phone', async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Solo en móvil')
  await signUpAndOnboard(page, request, uniqueEmail('board-mobile'))
  await page.goto('/settings/categories')
  await page.getByRole('button', { name: 'Usar el ejemplo' }).click()
  await expect(page.getByRole('region', { name: 'Estudios' })).toBeVisible()

  await page.goto('/board')
  await page
    .getByRole('navigation', { name: 'Vistas' })
    .getByRole('button', { name: 'Nueva tarea' })
    .click()
  const panel = page.getByRole('dialog', { name: 'Nueva tarea' })
  await panel.getByLabel('Título').fill('Llenar hoja de horas')
  await panel.getByLabel('Categoría', { exact: true }).selectOption({ label: 'Trabajo' })
  await panel.getByRole('button', { name: 'Crear tarea' }).click()

  await expect(
    page.getByRole('list', { name: 'Trabajo · Por hacer' }).getByText('Llenar hoja de horas'),
  ).toBeVisible()
  await page.getByRole('radio', { name: /En curso/ }).click()
  await expect(page.getByText('No hay tareas aquí.')).toBeVisible()
})
