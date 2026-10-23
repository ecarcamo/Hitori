import type { ChecklistItem, NewTask, Task, TaskChanges } from '../domain/task'

export interface NewChecklistItem {
  taskId: string
  label: string
  sortOrder: string
}

export type ChecklistItemChanges = Partial<Pick<ChecklistItem, 'label' | 'isDone' | 'sortOrder'>>

export interface TaskRepository {
  listTasks: (options: { completedSince: string }) => Promise<Task[]>
  createTask: (input: NewTask) => Promise<Task>
  updateTask: (id: string, changes: TaskChanges) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  addChecklistItem: (input: NewChecklistItem) => Promise<ChecklistItem>
  updateChecklistItem: (id: string, changes: ChecklistItemChanges) => Promise<void>
  deleteChecklistItem: (id: string) => Promise<void>
}
