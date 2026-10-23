import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Category } from '@/features/categories'
import { TaskPanelHost, useTaskPanel, type Task } from '@/features/tasks'
import { createFakeCategoryRepository, createFakeTaskRepository } from '@/test/fakes'
import { renderWithProviders } from '@/test/render'
import { BoardPage } from './BoardPage'

const TIMEZONE = 'America/Guatemala'

function category(id: string, name: string, overrides: Partial<Category> = {}): Category {
  return {
    id,
    name,
    tone: 1,
    aliases: [],
    sortOrder: id === 'u' ? 'a0' : 'a1',
    importantByDefault: false,
    urgencyDays: null,
    maxInProgress: null,
    archivedAt: null,
    subcategories: [],
    ...overrides,
  }
}

function task(id: string, overrides: Partial<Task> = {}): Task {
  return {
    id,
    title: id,
    notes: null,
    categoryId: 'u',
    subcategoryId: null,
    status: 'todo',
    isImportant: false,
    dueAt: null,
    durationMin: null,
    context: null,
    energy: null,
    blockedBy: null,
    sortOrder: 'a0',
    completedAt: null,
    createdAt: '2026-10-01T00:00:00Z',
    checklist: [],
    ...overrides,
  }
}

function setup(tasks: Task[] = [], limit = 3) {
  const user = userEvent.setup()
  const taskRepository = createFakeTaskRepository(tasks)
  const categoryRepository = createFakeCategoryRepository([
    category('u', 'U', {
      importantByDefault: true,
      subcategories: [
        { id: 'u-cursos', categoryId: 'u', name: 'Cursos', sortOrder: 'a0', archivedAt: null },
      ],
    }),
    category('w', 'Trabajo'),
  ])
  renderWithProviders(
    <>
      <BoardPage
        tasks={taskRepository}
        categories={categoryRepository}
        timezone={TIMEZONE}
        inProgressLimit={limit}
        urgencyDays={3}
        focusCategoryId={null}
      />
      <TaskPanelHost
        tasks={taskRepository}
        categories={categoryRepository}
        timezone={TIMEZONE}
        inProgressLimit={limit}
      />
    </>,
  )
  return { user, taskRepository }
}

describe('BoardPage', () => {
  beforeEach(() => {
    useTaskPanel.getState().close()
  })

  it('shows each task in its lane and column', async () => {
    setup([
      task('Publicar notas', { subcategoryId: 'u-cursos' }),
      task('Revisar PR', { categoryId: 'w', status: 'in_progress' }),
    ])

    const todo = await screen.findByRole('list', { name: 'U · Por hacer' })
    expect(within(todo).getByRole('button', { name: /Publicar notas/ })).toHaveTextContent('Cursos')
    expect(
      within(screen.getByRole('list', { name: 'Trabajo · En curso' })).getByText('Revisar PR'),
    ).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '1 de 3 en curso' })).toBeInTheDocument()
  })

  it('creates a task in a lane, inheriting the category importance', async () => {
    const { user, taskRepository } = setup()

    await user.click(await screen.findByRole('button', { name: 'Agregar tarea a U' }))
    const panel = screen.getByRole('dialog', { name: 'Nueva tarea' })
    expect(within(panel).getByRole('switch', { name: 'Importante' })).toBeChecked()

    await user.type(within(panel).getByLabelText('Título'), '  Entregar Tarea 6 ')
    await user.selectOptions(within(panel).getByLabelText('Subcategoría'), 'Cursos')
    await user.click(within(panel).getByRole('button', { name: 'Crear tarea' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(taskRepository.createTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Entregar Tarea 6',
        categoryId: 'u',
        subcategoryId: 'u-cursos',
        isImportant: true,
        status: 'todo',
      }),
    )
    expect(
      within(await screen.findByRole('list', { name: 'U · Por hacer' })).getByText(
        'Entregar Tarea 6',
      ),
    ).toBeInTheDocument()
  })

  it('requires a title', async () => {
    const { user, taskRepository } = setup()

    await user.click(await screen.findByRole('button', { name: 'Agregar tarea a U' }))
    await user.click(screen.getByRole('button', { name: 'Crear tarea' }))

    expect(screen.getByRole('alert')).toHaveTextContent('La tarea necesita un título.')
    expect(taskRepository.createTask).not.toHaveBeenCalled()
  })

  it('warns without blocking when starting more than the limit allows', async () => {
    const { user, taskRepository } = setup(
      [
        task('Uno', { status: 'in_progress' }),
        task('Dos', { status: 'in_progress', sortOrder: 'a1' }),
        task('Tres'),
      ],
      2,
    )

    await user.click(await screen.findByRole('button', { name: /Tres/ }))
    const panel = screen.getByRole('dialog', { name: 'Tarea' })
    await user.click(within(panel).getByRole('radio', { name: 'En curso' }))

    expect(within(panel).getByRole('status')).toHaveTextContent('Ya tienes 2 en curso en total')

    await user.click(within(panel).getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => {
      expect(taskRepository.updateTask).toHaveBeenCalledWith(
        'Tres',
        expect.objectContaining({ status: 'in_progress' }),
      )
    })
    expect(
      within(await screen.findByRole('list', { name: 'U · En curso' })).getByText('Tres'),
    ).toBeInTheDocument()
  })

  it('tracks steps and deletes a task after confirming', async () => {
    const { user, taskRepository } = setup([task('Calificar lab')])

    await user.click(await screen.findByRole('button', { name: /Calificar lab/ }))
    const panel = screen.getByRole('dialog', { name: 'Tarea' })
    await user.type(within(panel).getByLabelText('Nuevo paso'), 'Revisar rúbrica{Enter}')
    await user.click(await within(panel).findByRole('checkbox', { name: 'Revisar rúbrica' }))

    await waitFor(() => {
      expect(taskRepository.updateChecklistItem).toHaveBeenCalledWith(expect.any(String), {
        isDone: true,
      })
    })

    await user.click(within(panel).getByRole('button', { name: 'Borrar tarea' }))
    await user.click(within(panel).getByRole('button', { name: 'Sí, borrar' }))

    await waitFor(() => {
      expect(taskRepository.deleteTask).toHaveBeenCalledWith('Calificar lab')
    })
    expect(screen.queryByText('Calificar lab')).not.toBeInTheDocument()
  })
})
