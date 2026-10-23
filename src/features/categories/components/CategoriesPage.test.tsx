import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createFakeCategoryRepository } from '@/test/fakes'
import { renderWithProviders } from '@/test/render'
import type { Category } from '../domain/category'
import { CategoriesPage } from './CategoriesPage'

function category(id: string, name: string, sortOrder: string, overrides: Partial<Category> = {}) {
  return {
    id,
    name,
    tone: 1,
    aliases: [],
    sortOrder,
    importantByDefault: false,
    urgencyDays: null,
    maxInProgress: null,
    archivedAt: null,
    subcategories: [],
    ...overrides,
  } satisfies Category
}

function setup(initial: Category[] = []) {
  const user = userEvent.setup()
  const repository = createFakeCategoryRepository(initial)
  renderWithProviders(<CategoriesPage repository={repository} />)
  return { user, repository }
}

function cardNames() {
  return screen
    .getAllByRole('region')
    .map((region) => region.getAttribute('aria-label'))
    .filter((name) => name !== null)
}

describe('CategoriesPage', () => {
  it('offers a starter set when there are no categories', async () => {
    const { user, repository } = setup()

    await user.click(await screen.findByRole('button', { name: 'Usar el ejemplo' }))

    await waitFor(() => {
      expect(cardNames()).toEqual(['Estudios', 'Trabajo', 'Personal'])
    })
    expect(repository.createSubcategory).toHaveBeenCalledTimes(4)
  })

  it('creates a category and sets how its tasks behave', async () => {
    const { user, repository } = setup()

    await user.click(screen.getByRole('button', { name: 'Nueva categoría' }))
    await user.type(screen.getByLabelText('Nombre de la categoría'), '  U ')
    await user.click(screen.getByRole('button', { name: 'Crear categoría' }))

    const card = await screen.findByRole('region', { name: 'U' })
    expect(within(card).getByRole('button', { name: /U/, expanded: true })).toBeInTheDocument()

    await user.click(within(card).getByRole('button', { name: 'Agregar subcategoría' }))
    await user.type(within(card).getByLabelText('Nueva subcategoría de U'), 'Cursos{Enter}')
    await user.click(within(card).getByRole('button', { name: 'Agregar alias' }))
    await user.type(within(card).getByLabelText('Nuevo alias para U'), 'Ing Soft{Enter}')
    await user.click(within(card).getByRole('switch', { name: 'Importante por defecto' }))
    await user.click(within(card).getByRole('radio', { name: '1 día' }))
    await user.click(within(card).getByRole('radio', { name: 'verde' }))

    await waitFor(() => {
      expect(repository.createSubcategory).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Cursos' }),
      )
    })
    const changes = repository.updateCategory.mock.calls.map(([, change]) => change)
    expect(changes).toEqual(
      expect.arrayContaining([
        { aliases: ['ingsoft'] },
        { importantByDefault: true },
        { urgencyDays: 1 },
        { tone: 2 },
      ]),
    )
    expect(repository.createCategory).toHaveBeenCalledWith({ name: 'U', tone: 1, sortOrder: 'a0' })
  })

  it('does not allow two active categories with the same name', async () => {
    const { user, repository } = setup([category('c1', 'Trabajo', 'a0')])

    await screen.findByRole('region', { name: 'Trabajo' })
    await user.click(screen.getByRole('button', { name: 'Nueva categoría' }))
    await user.type(screen.getByLabelText('Nombre de la categoría'), 'trabajo')
    await user.click(screen.getByRole('button', { name: 'Crear categoría' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Ya existe con ese nombre.')
    expect(repository.createCategory).not.toHaveBeenCalled()
  })

  it('reorders the lanes and keeps the new order', async () => {
    const { user, repository } = setup([
      category('c1', 'U', 'a0'),
      category('c2', 'Trabajo', 'a1'),
      category('c3', 'Personal', 'a2'),
    ])

    await user.click(await screen.findByRole('button', { name: /^U/ }))
    await user.click(screen.getByRole('button', { name: 'Bajar' }))

    await waitFor(() => {
      expect(cardNames()).toEqual(['Trabajo', 'U', 'Personal'])
    })
    const [[id, changes] = []] = repository.updateCategory.mock.calls
    expect(id).toBe('c1')
    expect(changes?.sortOrder).toMatch(/^a1/)
  })

  it('archives a category and restores it', async () => {
    const { user } = setup([category('c1', 'U', 'a0'), category('c2', 'Trabajo', 'a1')])

    await user.click(await screen.findByRole('button', { name: /^Trabajo/ }))
    await user.click(screen.getByRole('button', { name: 'Archivar categoría' }))

    const archived = await screen.findByRole('region', { name: 'Archivadas' })
    expect(within(archived).getByText('Trabajo')).toBeInTheDocument()
    expect(cardNames()).toEqual(['U'])

    await user.click(within(archived).getByRole('button', { name: 'Restaurar' }))

    await waitFor(() => {
      expect(cardNames()).toEqual(['U', 'Trabajo'])
    })
  })
})
