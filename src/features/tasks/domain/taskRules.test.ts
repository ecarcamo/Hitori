import {
  inProgressWarning,
  isUrgent,
  overdueDays,
  overdueLabel,
  quadrantOf,
  validateTitle,
} from './taskRules'

const GUATEMALA = 'America/Guatemala'
const NOW = new Date('2026-10-22T20:00:00Z')

const due = (dueAt: string | null, status: 'todo' | 'done' = 'todo') => ({ dueAt, status })

describe('validateTitle', () => {
  it('needs a title', () => {
    expect(validateTitle('   ')).toBe('La tarea necesita un título.')
    expect(validateTitle(' Entregar lab ')).toBeNull()
  })
})

describe('overdue', () => {
  it('counts the calendar days late', () => {
    expect(overdueDays(due('2026-10-20T15:00:00Z'), NOW, GUATEMALA)).toBe(2)
    expect(overdueLabel(due('2026-10-20T15:00:00Z'), NOW, GUATEMALA)).toBe('Atrasada 2 días')
    expect(overdueLabel(due('2026-10-21T15:00:00Z'), NOW, GUATEMALA)).toBe('Atrasada 1 día')
  })

  it('says it was due today when the hour already passed', () => {
    expect(overdueLabel(due('2026-10-22T15:00:00Z'), NOW, GUATEMALA)).toBe('Venció hoy')
  })

  it('never marks finished or undated tasks', () => {
    expect(overdueLabel(due('2026-10-20T15:00:00Z', 'done'), NOW, GUATEMALA)).toBeNull()
    expect(overdueLabel(due(null), NOW, GUATEMALA)).toBeNull()
    expect(overdueLabel(due('2026-10-25T15:00:00Z'), NOW, GUATEMALA)).toBeNull()
  })
})

describe('urgency and quadrant', () => {
  it('is urgent within the threshold or when late', () => {
    expect(isUrgent(due('2026-10-25T15:00:00Z'), NOW, 3, GUATEMALA)).toBe(true)
    expect(isUrgent(due('2026-10-26T15:00:00Z'), NOW, 3, GUATEMALA)).toBe(false)
    expect(isUrgent(due('2026-10-20T15:00:00Z'), NOW, 3, GUATEMALA)).toBe(true)
    expect(isUrgent(due(null), NOW, 3, GUATEMALA)).toBe(false)
  })

  it.each([
    [true, '2026-10-23T15:00:00Z', 'do'],
    [true, null, 'schedule'],
    [false, '2026-10-23T15:00:00Z', 'batch'],
    [false, null, 'drop'],
  ] as const)('important=%s due=%s goes to %s', (isImportant, dueAt, quadrant) => {
    expect(quadrantOf({ isImportant, dueAt, status: 'todo' }, NOW, 3, GUATEMALA)).toBe(quadrant)
  })
})

describe('inProgressWarning', () => {
  const tasks = [
    { id: 'a', status: 'in_progress', categoryId: 'u' },
    { id: 'b', status: 'in_progress', categoryId: 'u' },
    { id: 'c', status: 'todo', categoryId: 'w' },
  ] as const
  const limits = (global: number, byCategory: number | null = null) => ({
    global,
    byCategory: () => byCategory,
  })

  it('warns when the global limit is reached', () => {
    expect(
      inProgressWarning(tasks, { id: 'c', categoryId: 'w', nextStatus: 'in_progress' }, limits(2)),
    ).toEqual({ kind: 'global', limit: 2, count: 2 })
  })

  it('warns when the category limit is reached', () => {
    expect(
      inProgressWarning(
        tasks,
        { id: null, categoryId: 'u', nextStatus: 'in_progress' },
        limits(3, 2),
      ),
    ).toEqual({ kind: 'category', limit: 2, count: 2 })
  })

  it('stays quiet while there is room or the task is not starting', () => {
    expect(
      inProgressWarning(tasks, { id: 'c', categoryId: 'w', nextStatus: 'in_progress' }, limits(3)),
    ).toBeNull()
    expect(
      inProgressWarning(tasks, { id: 'c', categoryId: 'w', nextStatus: 'waiting' }, limits(1)),
    ).toBeNull()
    expect(
      inProgressWarning(tasks, { id: 'a', categoryId: 'u', nextStatus: 'in_progress' }, limits(2)),
    ).toBeNull()
  })
})
