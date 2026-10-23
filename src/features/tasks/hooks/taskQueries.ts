import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import type { ChecklistItem, NewTask, Task, TaskChanges } from '../domain/task'
import type {
  ChecklistItemChanges,
  NewChecklistItem,
  TaskRepository,
} from '../repositories/taskRepository'

const TASKS_KEY = ['tasks'] as const
const DONE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

export function tasksQueryOptions(repository: TaskRepository) {
  return queryOptions({
    queryKey: TASKS_KEY,
    queryFn: () =>
      repository.listTasks({
        completedSince: new Date(Date.now() - DONE_WINDOW_MS).toISOString(),
      }),
  })
}

export function useTasks(repository: TaskRepository) {
  return useQuery(tasksQueryOptions(repository))
}

function applyTaskChanges(task: Task, changes: TaskChanges): Task {
  const next = { ...task, ...changes }
  if (changes.status === undefined || changes.status === task.status) {
    return next
  }
  return { ...next, completedAt: changes.status === 'done' ? new Date().toISOString() : null }
}

function useOptimisticTasks() {
  const queryClient = useQueryClient()
  return {
    queryClient,
    async patch(update: (tasks: Task[]) => Task[]) {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY })
      const previous = queryClient.getQueryData<Task[]>(TASKS_KEY)
      if (previous) {
        queryClient.setQueryData<Task[]>(TASKS_KEY, update(previous))
      }
      return { previous }
    },
    rollback(context: { previous: Task[] | undefined } | undefined) {
      if (context?.previous) {
        queryClient.setQueryData(TASKS_KEY, context.previous)
      }
    },
    settle: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  }
}

function mapTask(tasks: Task[], id: string, update: (task: Task) => Task) {
  return tasks.map((task) => (task.id === id ? update(task) : task))
}

function upsertTask(queryClient: QueryClient, task: Task) {
  queryClient.setQueryData<Task[]>(TASKS_KEY, (tasks = []) => [
    ...tasks.filter((item) => item.id !== task.id),
    task,
  ])
}

export function useTaskMutations(repository: TaskRepository) {
  const optimistic = useOptimisticTasks()

  const createTask = useMutation({
    mutationFn: (input: NewTask) => repository.createTask(input),
    onSuccess: (task) => {
      upsertTask(optimistic.queryClient, task)
    },
    onSettled: optimistic.settle,
  })

  const updateTask = useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: TaskChanges }) =>
      repository.updateTask(id, changes),
    onMutate: ({ id, changes }) =>
      optimistic.patch((tasks) => mapTask(tasks, id, (task) => applyTaskChanges(task, changes))),
    onError: (_error, _variables, context) => {
      optimistic.rollback(context)
    },
    onSettled: optimistic.settle,
  })

  const deleteTask = useMutation({
    mutationFn: (id: string) => repository.deleteTask(id),
    onMutate: (id) => optimistic.patch((tasks) => tasks.filter((task) => task.id !== id)),
    onError: (_error, _variables, context) => {
      optimistic.rollback(context)
    },
    onSettled: optimistic.settle,
  })

  const addChecklistItem = useMutation({
    mutationFn: (input: NewChecklistItem) => repository.addChecklistItem(input),
    onSuccess: (item: ChecklistItem) => {
      optimistic.queryClient.setQueryData<Task[]>(TASKS_KEY, (tasks = []) =>
        mapTask(tasks, item.taskId, (task) => ({ ...task, checklist: [...task.checklist, item] })),
      )
    },
    onSettled: optimistic.settle,
  })

  const updateChecklistItem = useMutation({
    mutationFn: ({ id, changes }: { id: string; taskId: string; changes: ChecklistItemChanges }) =>
      repository.updateChecklistItem(id, changes),
    onMutate: ({ id, taskId, changes }) =>
      optimistic.patch((tasks) =>
        mapTask(tasks, taskId, (task) => ({
          ...task,
          checklist: task.checklist.map((item) =>
            item.id === id ? { ...item, ...changes } : item,
          ),
        })),
      ),
    onError: (_error, _variables, context) => {
      optimistic.rollback(context)
    },
    onSettled: optimistic.settle,
  })

  const deleteChecklistItem = useMutation({
    mutationFn: ({ id }: { id: string; taskId: string }) => repository.deleteChecklistItem(id),
    onMutate: ({ id, taskId }) =>
      optimistic.patch((tasks) =>
        mapTask(tasks, taskId, (task) => ({
          ...task,
          checklist: task.checklist.filter((item) => item.id !== id),
        })),
      ),
    onError: (_error, _variables, context) => {
      optimistic.rollback(context)
    },
    onSettled: optimistic.settle,
  })

  return {
    createTask,
    updateTask,
    deleteTask,
    addChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
  }
}

export type TaskMutations = ReturnType<typeof useTaskMutations>
