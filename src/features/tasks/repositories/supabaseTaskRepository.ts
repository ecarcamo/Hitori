import type { Database } from '@/shared/lib/database.types'
import type { AppSupabaseClient } from '@/shared/lib/supabase'
import type { ChecklistItem, NewTask, Task, TaskChanges, TaskFields } from '../domain/task'
import type { ChecklistItemChanges, TaskRepository } from './taskRepository'

type TaskRow = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']
type ChecklistRow = Database['public']['Tables']['checklist_items']['Row']

const CHECKLIST_COLUMNS = 'id, task_id, label, is_done, sort_order'
const TASK_COLUMNS = `id, category_id, subcategory_id, title, notes, status, is_important, due_at, duration_min, context, energy, blocked_by, sort_order, completed_at, created_at, checklist_items(${CHECKLIST_COLUMNS})`

type ChecklistSelection = Pick<ChecklistRow, 'id' | 'task_id' | 'label' | 'is_done' | 'sort_order'>
type TaskSelection = Pick<
  TaskRow,
  | 'id'
  | 'category_id'
  | 'subcategory_id'
  | 'title'
  | 'notes'
  | 'status'
  | 'is_important'
  | 'due_at'
  | 'duration_min'
  | 'context'
  | 'energy'
  | 'blocked_by'
  | 'sort_order'
  | 'completed_at'
  | 'created_at'
> & { checklist_items: ChecklistSelection[] }

function toChecklistItem(row: ChecklistSelection): ChecklistItem {
  return {
    id: row.id,
    taskId: row.task_id,
    label: row.label,
    isDone: row.is_done,
    sortOrder: row.sort_order,
  }
}

function toTask(row: TaskSelection): Task {
  return {
    id: row.id,
    categoryId: row.category_id,
    subcategoryId: row.subcategory_id,
    title: row.title,
    notes: row.notes,
    status: row.status,
    isImportant: row.is_important,
    dueAt: row.due_at,
    durationMin: row.duration_min,
    context: row.context,
    energy: row.energy,
    blockedBy: row.blocked_by,
    sortOrder: row.sort_order,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    checklist: row.checklist_items
      .map(toChecklistItem)
      .sort((first, second) => (first.sortOrder < second.sortOrder ? -1 : 1)),
  }
}

function toFieldColumns(fields: Partial<TaskFields>): TaskUpdate {
  return {
    ...(fields.title !== undefined ? { title: fields.title } : {}),
    ...(fields.notes !== undefined ? { notes: fields.notes } : {}),
    ...(fields.categoryId !== undefined ? { category_id: fields.categoryId } : {}),
    ...(fields.subcategoryId !== undefined ? { subcategory_id: fields.subcategoryId } : {}),
    ...(fields.status !== undefined ? { status: fields.status } : {}),
    ...(fields.isImportant !== undefined ? { is_important: fields.isImportant } : {}),
    ...(fields.dueAt !== undefined ? { due_at: fields.dueAt } : {}),
    ...(fields.durationMin !== undefined ? { duration_min: fields.durationMin } : {}),
    ...(fields.context !== undefined ? { context: fields.context } : {}),
    ...(fields.energy !== undefined ? { energy: fields.energy } : {}),
    ...(fields.blockedBy !== undefined ? { blocked_by: fields.blockedBy } : {}),
  }
}

function toTaskUpdate(changes: TaskChanges): TaskUpdate {
  return {
    ...toFieldColumns(changes),
    ...(changes.sortOrder !== undefined ? { sort_order: changes.sortOrder } : {}),
    ...(changes.archivedAt !== undefined ? { archived_at: changes.archivedAt } : {}),
  }
}

function toChecklistUpdate(changes: ChecklistItemChanges) {
  return {
    ...(changes.label !== undefined ? { label: changes.label } : {}),
    ...(changes.isDone !== undefined ? { is_done: changes.isDone } : {}),
    ...(changes.sortOrder !== undefined ? { sort_order: changes.sortOrder } : {}),
  }
}

function failed(message: string, cause: unknown) {
  return new Error(message, { cause })
}

const SAVE_FAILED = 'No se pudieron guardar los cambios.'

export function createSupabaseTaskRepository(client: AppSupabaseClient): TaskRepository {
  return {
    async listTasks({ completedSince }) {
      const { data, error } = await client
        .from('tasks')
        .select(TASK_COLUMNS)
        .is('archived_at', null)
        .or(`status.neq.done,completed_at.gte.${completedSince}`)
        .order('sort_order')
      if (error) {
        throw failed('No se pudieron cargar tus tareas.', error)
      }
      return data.map(toTask)
    },
    async createTask(input: NewTask) {
      const insert: TaskInsert = {
        ...toFieldColumns(input),
        title: input.title,
        sort_order: input.sortOrder,
      }
      const { data, error } = await client
        .from('tasks')
        .insert(insert)
        .select(TASK_COLUMNS)
        .single()
      if (error) {
        throw failed('No se pudo crear la tarea.', error)
      }
      return toTask(data)
    },
    async updateTask(id, changes) {
      const { error } = await client.from('tasks').update(toTaskUpdate(changes)).eq('id', id)
      if (error) {
        throw failed(SAVE_FAILED, error)
      }
    },
    async deleteTask(id) {
      const { error } = await client.from('tasks').delete().eq('id', id)
      if (error) {
        throw failed('No se pudo borrar la tarea.', error)
      }
    },
    async addChecklistItem(input) {
      const { data, error } = await client
        .from('checklist_items')
        .insert({ task_id: input.taskId, label: input.label, sort_order: input.sortOrder })
        .select(CHECKLIST_COLUMNS)
        .single()
      if (error) {
        throw failed(SAVE_FAILED, error)
      }
      return toChecklistItem(data)
    },
    async updateChecklistItem(id, changes) {
      const { error } = await client
        .from('checklist_items')
        .update(toChecklistUpdate(changes))
        .eq('id', id)
      if (error) {
        throw failed(SAVE_FAILED, error)
      }
    },
    async deleteChecklistItem(id) {
      const { error } = await client.from('checklist_items').delete().eq('id', id)
      if (error) {
        throw failed(SAVE_FAILED, error)
      }
    },
  }
}
