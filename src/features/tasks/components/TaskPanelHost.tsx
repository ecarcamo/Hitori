import { useQuery } from '@tanstack/react-query'
import {
  categoriesQueryOptions,
  isActive,
  type Category,
  type CategoryRepository,
} from '@/features/categories'
import { sortOrderAfter } from '@/shared/lib/sortOrder'
import { SidePanel } from '@/shared/ui'
import { emptyTaskFields, type Task, type TaskFields } from '../domain/task'
import { inProgressWarning, inProgressWarningMessage } from '../domain/taskRules'
import { useTaskMutations, useTasks } from '../hooks/taskQueries'
import type { TaskRepository } from '../repositories/taskRepository'
import { useTaskPanel } from '../state/taskPanelStore'
import { ChecklistEditor } from './ChecklistEditor'
import { DeleteTaskButton } from './DeleteTaskButton'
import { TaskForm } from './TaskForm'
import styles from './TaskPanelHost.module.css'

interface TaskPanelHostProps {
  tasks: TaskRepository
  categories: CategoryRepository
  timezone: string
  inProgressLimit: number
}

function fieldsOf(task: Task): TaskFields {
  return {
    title: task.title,
    notes: task.notes,
    categoryId: task.categoryId,
    subcategoryId: task.subcategoryId,
    status: task.status,
    isImportant: task.isImportant,
    dueAt: task.dueAt,
    durationMin: task.durationMin,
    context: task.context,
    energy: task.energy,
    blockedBy: task.blockedBy,
  }
}

function initialImportance(categories: readonly Category[], defaults: Partial<TaskFields>) {
  if (defaults.isImportant !== undefined) {
    return defaults.isImportant
  }
  return categories.find((category) => category.id === defaults.categoryId)?.importantByDefault
}

export function TaskPanelHost({
  tasks: taskRepository,
  categories: categoryRepository,
  timezone,
  inProgressLimit,
}: TaskPanelHostProps) {
  const panel = useTaskPanel((state) => state.panel)
  const close = useTaskPanel((state) => state.close)
  const { data: tasks = [] } = useTasks(taskRepository)
  const { data: allCategories = [] } = useQuery(categoriesQueryOptions(categoryRepository))
  const mutations = useTaskMutations(taskRepository)
  const categories = allCategories.filter(isActive)

  const warningFor =
    (taskId: string | null) => (fields: Pick<TaskFields, 'status' | 'categoryId'>) => {
      const warning = inProgressWarning(
        tasks,
        { id: taskId, categoryId: fields.categoryId, nextStatus: fields.status },
        {
          global: inProgressLimit,
          byCategory: (categoryId) =>
            categories.find((category) => category.id === categoryId)?.maxInProgress ?? null,
        },
      )
      return warning ? inProgressWarningMessage(warning) : null
    }

  const editing = panel.kind === 'edit' ? tasks.find((task) => task.id === panel.taskId) : undefined

  return (
    <SidePanel
      open={panel.kind !== 'closed'}
      title={panel.kind === 'create' ? 'Nueva tarea' : 'Tarea'}
      onClose={close}
    >
      {panel.kind === 'create' ? (
        <TaskForm
          initial={emptyTaskFields({
            ...panel.defaults,
            isImportant: initialImportance(categories, panel.defaults) ?? false,
          })}
          categories={categories}
          timezone={timezone}
          inheritImportance
          submitLabel="Crear tarea"
          isPending={mutations.createTask.isPending}
          error={mutations.createTask.error?.message ?? null}
          warningFor={warningFor(null)}
          onSubmit={(fields) => {
            const sameCell = tasks.filter(
              (task) => task.status === fields.status && task.categoryId === fields.categoryId,
            )
            mutations.createTask.mutate(
              { ...fields, sortOrder: sortOrderAfter(sameCell) },
              { onSuccess: close },
            )
          }}
        />
      ) : null}
      {panel.kind === 'edit' && editing ? (
        <TaskForm
          key={editing.id}
          initial={fieldsOf(editing)}
          categories={categories}
          timezone={timezone}
          inheritImportance={false}
          submitLabel="Guardar cambios"
          isPending={mutations.updateTask.isPending}
          error={mutations.updateTask.error?.message ?? null}
          warningFor={warningFor(editing.id)}
          onSubmit={(fields) => {
            mutations.updateTask.mutate({ id: editing.id, changes: fields }, { onSuccess: close })
          }}
        >
          <ChecklistEditor task={editing} mutations={mutations} />
          <DeleteTaskButton
            onDelete={() => {
              mutations.deleteTask.mutate(editing.id)
              close()
            }}
          />
        </TaskForm>
      ) : null}
      {panel.kind === 'edit' && !editing ? (
        <p className={styles.missing}>Esta tarea ya no existe.</p>
      ) : null}
    </SidePanel>
  )
}
