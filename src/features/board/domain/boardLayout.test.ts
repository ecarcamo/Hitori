import type { Category } from '@/features/categories'
import type { Task } from '@/features/tasks'
import { buildBoard, subcategoryNameOf } from './boardLayout'

const NOW = new Date('2026-10-22T20:00:00Z')

function category(id: string, name: string): Category {
  return {
    id,
    name,
    tone: 1,
    aliases: [],
    sortOrder: 'a0',
    importantByDefault: false,
    urgencyDays: null,
    maxInProgress: null,
    archivedAt: null,
    subcategories: [
      { id: `${id}-sub`, categoryId: id, name: 'Cursos', sortOrder: 'a0', archivedAt: null },
    ],
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

describe('buildBoard', () => {
  const categories = [category('u', 'U'), category('w', 'Trabajo')]

  it('places each task in its lane and column, in order', () => {
    const board = buildBoard(
      [
        task('b', { sortOrder: 'a1' }),
        task('a', { sortOrder: 'a0' }),
        task('c', { categoryId: 'w', status: 'in_progress' }),
      ],
      categories,
      NOW,
      'America/Guatemala',
    )

    expect(board.lanes.map((lane) => lane.category.name)).toEqual(['U', 'Trabajo'])
    expect(board.lanes[0]?.cells.todo.map((item) => item.id)).toEqual(['a', 'b'])
    expect(board.lanes[1]?.cells.in_progress.map((item) => item.id)).toEqual(['c'])
  })

  it('counts active, late and inbox tasks', () => {
    const board = buildBoard(
      [
        task('late', { dueAt: '2026-10-20T15:00:00Z' }),
        task('doing', { status: 'in_progress' }),
        task('done', { status: 'done', completedAt: '2026-10-21T00:00:00Z' }),
        task('loose', { categoryId: null }),
        task('archived-lane', { categoryId: 'gone' }),
      ],
      categories,
      NOW,
      'America/Guatemala',
    )

    expect(board.activeCount).toBe(2)
    expect(board.overdueCount).toBe(1)
    expect(board.inboxCount).toBe(2)
    expect(board.totals).toEqual({ todo: 1, in_progress: 1, waiting: 0, done: 1 })
  })
})

describe('subcategoryNameOf', () => {
  it('finds the subcategory name', () => {
    expect(subcategoryNameOf(category('u', 'U'), 'u-sub')).toBe('Cursos')
    expect(subcategoryNameOf(category('u', 'U'), null)).toBeNull()
  })
})
