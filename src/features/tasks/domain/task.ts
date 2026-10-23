export const TASK_TITLE_MAX_LENGTH = 300
export const TASK_NOTES_MAX_LENGTH = 10_000
export const BLOCKED_BY_MAX_LENGTH = 300
export const CHECKLIST_LABEL_MAX_LENGTH = 300

export const TASK_STATUSES = ['todo', 'in_progress', 'waiting', 'done'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Por hacer',
  in_progress: 'En curso',
  waiting: 'Esperando',
  done: 'Hecho',
}

export const TASK_CONTEXTS = ['home', 'computer', 'campus', 'office', 'errands'] as const
export type TaskContext = (typeof TASK_CONTEXTS)[number]

export const CONTEXT_LABELS: Record<TaskContext, string> = {
  home: 'Casa',
  computer: 'Compu',
  campus: 'Universidad',
  office: 'Oficina',
  errands: 'En la calle',
}

export const ENERGY_LEVELS = ['low', 'high'] as const
export type EnergyLevel = (typeof ENERGY_LEVELS)[number]

export const ENERGY_LABELS: Record<EnergyLevel, string> = {
  low: 'Baja',
  high: 'Alta',
}

export const DURATION_CHOICES = [10, 15, 20, 30, 45, 60, 90, 120, 180, 240] as const

export interface ChecklistItem {
  id: string
  taskId: string
  label: string
  isDone: boolean
  sortOrder: string
}

export interface TaskFields {
  title: string
  notes: string | null
  categoryId: string | null
  subcategoryId: string | null
  status: TaskStatus
  isImportant: boolean
  dueAt: string | null
  durationMin: number | null
  context: TaskContext | null
  energy: EnergyLevel | null
  blockedBy: string | null
}

export interface Task extends TaskFields {
  id: string
  sortOrder: string
  completedAt: string | null
  createdAt: string
  checklist: ChecklistItem[]
}

export interface NewTask extends TaskFields {
  sortOrder: string
}

export type TaskChanges = Partial<TaskFields & { sortOrder: string; archivedAt: string | null }>

export function emptyTaskFields(overrides: Partial<TaskFields> = {}): TaskFields {
  return {
    title: '',
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
    ...overrides,
  }
}
