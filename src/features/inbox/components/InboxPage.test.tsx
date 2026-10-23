import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Category } from '@/features/categories'
import type { Task } from '@/features/tasks'
import { createFakeCategoryRepository, createFakeTaskRepository } from '@/test/fakes'
import { renderWithProviders } from '@/test/render'
import { InboxPage } from './InboxPage'

const WORK: Category = {
  id: 'w',
  name: 'Trabajo',
  tone: 2,
  aliases: [],
  sortOrder: 'a0',
  importantByDefault: true,
  urgencyDays: null,
  maxInProgress: null,
  archivedAt: null,
  subcategories: [],
}

function loose(id: string, title: string): Task {
  return {
    id,
    title,
    notes: null,
    categoryId: null,
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
  }
}

describe('InboxPage triage', () => {
  it('classifies the inbox one task at a time', async () => {
    const user = userEvent.setup()
    const tasks = createFakeTaskRepository([loose('a', 'Idea A'), loose('b', 'Idea B')])
    renderWithProviders(
      <InboxPage
        tasks={tasks}
        categories={createFakeCategoryRepository([WORK])}
        timezone="America/Guatemala"
        urgencyDays={3}
      />,
    )

    await user.click(await screen.findByRole('button', { name: 'Clasificar' }))
    expect(screen.getByText('Quedan 2')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Idea A' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Trabajo' }))

    await waitFor(() => {
      expect(tasks.updateTask).toHaveBeenCalledWith('a', { categoryId: 'w', isImportant: true })
    })
    expect(await screen.findByRole('heading', { name: 'Idea B' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Saltar' }))

    expect(screen.getByRole('heading', { name: 'Ya pasaste por todas.' })).toBeInTheDocument()
  })
})
