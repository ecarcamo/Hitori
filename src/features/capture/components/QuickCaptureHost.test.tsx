import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Category } from '@/features/categories'
import { useTaskPanel } from '@/features/tasks'
import { ToastHost } from '@/shared/ui'
import { createFakeCategoryRepository, createFakeTaskRepository } from '@/test/fakes'
import { renderWithProviders } from '@/test/render'
import { useCapture } from '../state/captureStore'
import { QuickCaptureHost } from './QuickCaptureHost'

const ANY_DATE: unknown = expect.any(String)

const U: Category = {
  id: 'u',
  name: 'U',
  tone: 1,
  aliases: ['uvg'],
  sortOrder: 'a0',
  importantByDefault: false,
  urgencyDays: null,
  maxInProgress: null,
  archivedAt: null,
  subcategories: [
    {
      id: 'u-cursos',
      categoryId: 'u',
      name: 'Cursos',
      aliases: ['ingsoft'],
      sortOrder: 'a0',
      archivedAt: null,
    },
  ],
}

function setup() {
  const user = userEvent.setup()
  const tasks = createFakeTaskRepository()
  const categories = createFakeCategoryRepository([U])
  renderWithProviders(
    <>
      <QuickCaptureHost tasks={tasks} categories={categories} timezone="America/Guatemala" />
      <ToastHost />
    </>,
  )
  act(() => {
    useCapture.getState().open()
  })
  return { user, tasks }
}

describe('QuickCaptureHost', () => {
  beforeEach(() => {
    useCapture.getState().close()
    useTaskPanel.getState().close()
  })

  it('creates a task from one line and says where it went', async () => {
    const { user, tasks } = setup()

    const input = await screen.findByLabelText('Qué hay que hacer')
    await user.type(input, 'Entregar Tarea 6 IngSoft vie 8pm !')

    const preview = screen.getByRole('region', { name: 'Lo que entendió Hitori' })
    expect(within(preview).getByText('Entregar Tarea 6')).toBeInTheDocument()
    expect(within(preview).getByText('U · Cursos')).toBeInTheDocument()
    expect(within(preview).getByText('Importante')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Crear tarea' }))

    await waitFor(() => {
      expect(tasks.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Entregar Tarea 6',
          categoryId: 'u',
          subcategoryId: 'u-cursos',
          isImportant: true,
          dueAt: ANY_DATE,
          status: 'todo',
        }),
      )
    })
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Listo: «Entregar Tarea 6» está en U.',
    )
    expect(useCapture.getState().isOpen).toBe(false)
  })

  it('lets the person drop an interpretation', async () => {
    const { user, tasks } = setup()

    await user.type(await screen.findByLabelText('Qué hay que hacer'), 'Leer capítulo uvg')
    await user.click(screen.getByRole('button', { name: 'No usar «U»' }))

    expect(screen.getByText('Leer capítulo uvg')).toBeInTheDocument()
    expect(screen.getByText('Bandeja')).toBeInTheDocument()

    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(tasks.createTask).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Leer capítulo uvg', categoryId: null }),
      )
    })
  })

  it('hands the parsed fields to the full form', async () => {
    const { user } = setup()

    await user.type(await screen.findByLabelText('Qué hay que hacer'), 'Barrer 20min @casa')
    await user.click(screen.getByRole('button', { name: 'Más detalles' }))

    const { panel } = useTaskPanel.getState()
    expect(panel.kind).toBe('create')
    expect(panel.kind === 'create' ? panel.defaults : null).toMatchObject({
      title: 'Barrer',
      durationMin: 20,
      context: 'home',
    })
  })

  it('does not create a task without a title', async () => {
    const { user } = setup()

    await user.type(await screen.findByLabelText('Qué hay que hacer'), 'mañana !')

    expect(screen.getByText('Falta el título')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crear tarea' })).toBeDisabled()
  })
})
