import type { Category } from '@/features/categories'
import { overdueLabel, TASK_STATUSES, type Task, type TaskStatus } from '@/features/tasks'
import { bySortOrder } from '@/shared/lib/sortOrder'

export type StatusCells = Record<TaskStatus, Task[]>

export interface Lane {
  category: Category
  cells: StatusCells
}

export interface Board {
  lanes: Lane[]
  totals: Record<TaskStatus, number>
  activeCount: number
  overdueCount: number
  inboxCount: number
}

function emptyCells(): StatusCells {
  return { todo: [], in_progress: [], waiting: [], done: [] }
}

export function buildBoard(
  tasks: readonly Task[],
  categories: readonly Category[],
  now: Date,
  timezone: string,
): Board {
  const lanes = categories.map((category) => ({ category, cells: emptyCells() }))
  const laneById = new Map(lanes.map((lane) => [lane.category.id, lane]))
  const totals: Record<TaskStatus, number> = { todo: 0, in_progress: 0, waiting: 0, done: 0 }
  let inboxCount = 0
  let overdueCount = 0

  for (const task of [...tasks].sort(bySortOrder)) {
    const lane = task.categoryId ? laneById.get(task.categoryId) : undefined
    if (!lane) {
      if (task.status !== 'done') {
        inboxCount += 1
      }
      continue
    }
    lane.cells[task.status].push(task)
    totals[task.status] += 1
    if (overdueLabel(task, now, timezone)) {
      overdueCount += 1
    }
  }

  const activeCount = TASK_STATUSES.filter((status) => status !== 'done').reduce(
    (sum, status) => sum + totals[status],
    0,
  )

  return { lanes, totals, activeCount, overdueCount, inboxCount }
}

export function laneAnchorId(categoryId: string) {
  return `carril-${categoryId}`
}

export function subcategoryNameOf(category: Category, subcategoryId: string | null) {
  if (!subcategoryId) {
    return null
  }
  return (
    category.subcategories.find((subcategory) => subcategory.id === subcategoryId)?.name ?? null
  )
}
