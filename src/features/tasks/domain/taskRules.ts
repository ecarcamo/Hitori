import type { QuadrantId } from '@/shared/ui'
import { calendarDaysFromToday } from './dueDate'
import { TASK_TITLE_MAX_LENGTH, type Task, type TaskStatus } from './task'

export const DEFAULT_IN_PROGRESS_LIMIT = 3
export const DEFAULT_URGENCY_DAYS = 3

export const QUADRANT_LABELS: Record<QuadrantId, string> = {
  do: 'Hacer ya',
  schedule: 'Agendar',
  batch: 'Resolver en lote',
  drop: 'Soltar',
}

type DueTask = Pick<Task, 'dueAt' | 'status'>

export function normalizeTitle(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

export function validateTitle(value: string) {
  const title = normalizeTitle(value)
  if (title === '') {
    return 'La tarea necesita un título.'
  }
  if (title.length > TASK_TITLE_MAX_LENGTH) {
    return `Usa ${String(TASK_TITLE_MAX_LENGTH)} caracteres o menos.`
  }
  return null
}

export function isOverdue(task: DueTask, now: Date) {
  return task.status !== 'done' && task.dueAt !== null && new Date(task.dueAt) < now
}

export function overdueDays(task: DueTask, now: Date, timezone: string) {
  if (!isOverdue(task, now) || task.dueAt === null) {
    return 0
  }
  return Math.max(0, -calendarDaysFromToday(task.dueAt, now, timezone))
}

export function overdueLabel(task: DueTask, now: Date, timezone: string) {
  if (!isOverdue(task, now)) {
    return null
  }
  const days = overdueDays(task, now, timezone)
  if (days === 0) {
    return 'Venció hoy'
  }
  return days === 1 ? 'Atrasada 1 día' : `Atrasada ${String(days)} días`
}

export function isUrgent(task: DueTask, now: Date, urgencyDays: number, timezone: string) {
  if (task.status === 'done' || task.dueAt === null) {
    return false
  }
  return isOverdue(task, now) || calendarDaysFromToday(task.dueAt, now, timezone) <= urgencyDays
}

export function quadrantOf(
  task: DueTask & Pick<Task, 'isImportant'>,
  now: Date,
  urgencyDays: number,
  timezone: string,
): QuadrantId {
  const urgent = isUrgent(task, now, urgencyDays, timezone)
  if (task.isImportant) {
    return urgent ? 'do' : 'schedule'
  }
  return urgent ? 'batch' : 'drop'
}

export interface InProgressLimits {
  global: number
  byCategory: (categoryId: string) => number | null
}

export interface InProgressWarning {
  kind: 'global' | 'category'
  limit: number
  count: number
}

export function inProgressWarning(
  tasks: readonly Pick<Task, 'id' | 'status' | 'categoryId'>[],
  moving: { id: string | null; categoryId: string | null; nextStatus: TaskStatus },
  limits: InProgressLimits,
): InProgressWarning | null {
  if (moving.nextStatus !== 'in_progress') {
    return null
  }
  const others = tasks.filter((task) => task.status === 'in_progress' && task.id !== moving.id)
  if (others.length >= limits.global) {
    return { kind: 'global', limit: limits.global, count: others.length }
  }
  const categoryLimit = moving.categoryId ? limits.byCategory(moving.categoryId) : null
  if (categoryLimit !== null) {
    const inCategory = others.filter((task) => task.categoryId === moving.categoryId)
    if (inCategory.length >= categoryLimit) {
      return { kind: 'category', limit: categoryLimit, count: inCategory.length }
    }
  }
  return null
}

export function inProgressWarningMessage(warning: InProgressWarning) {
  const scope = warning.kind === 'global' ? 'en total' : 'en esta categoría'
  const limit = warning.kind === 'global' ? 'tu límite' : 'su límite'
  return `Ya tienes ${String(warning.count)} en curso ${scope} y ${limit} es ${String(warning.limit)}. Puedes seguir, pero conviene terminar algo antes de empezar otra.`
}
