import { vi } from 'vitest'
import type { AuthRepository, AuthSession } from '@/features/auth'
import type { Category, CategoryRepository, Subcategory } from '@/features/categories'
import type { Profile, ProfileRepository } from '@/features/profile'
import type { Task, TaskRepository } from '@/features/tasks'

export const TEST_SESSION: AuthSession = { userId: 'user-1', email: 'ana@hitori.test' }

export const ONBOARDED_PROFILE: Profile = {
  id: 'user-1',
  displayName: 'Ana',
  timezone: 'America/Guatemala',
  onboardedAt: '2026-10-22T18:00:00Z',
  maxInProgress: 3,
  urgencyDays: 3,
}

export function createFakeAuthRepository(session: AuthSession | null = TEST_SESSION) {
  let current = session
  const signedOutListeners = new Set<() => void>()

  const repository = {
    getSession: vi.fn(() => Promise.resolve(current)),
    sendSignInCode: vi.fn(() => Promise.resolve()),
    verifySignInCode: vi.fn((email: string) => {
      current = { userId: 'user-1', email }
      return Promise.resolve(current)
    }),
    signInWithGoogle: vi.fn(() => Promise.resolve()),
    signOut: vi.fn(() => {
      current = null
      signedOutListeners.forEach((listener) => {
        listener()
      })
      return Promise.resolve()
    }),
    onSignedOut: vi.fn((listener: () => void) => {
      signedOutListeners.add(listener)
      return () => {
        signedOutListeners.delete(listener)
      }
    }),
  } satisfies AuthRepository

  return repository
}

export function createFakeProfileRepository(initial: Profile = ONBOARDED_PROFILE) {
  let profile = initial

  const repository = {
    getProfile: vi.fn(() => Promise.resolve(profile)),
    updateProfile: vi.fn((_userId: string, changes: Partial<Profile>) => {
      profile = { ...profile, ...changes }
      return Promise.resolve(profile)
    }),
  } satisfies ProfileRepository

  return repository
}

export function createFakeCategoryRepository(initial: Category[] = []) {
  let categories = structuredClone(initial)
  let sequence = 0
  const nextId = (prefix: string) => {
    sequence += 1
    return `${prefix}-${String(sequence)}`
  }

  const repository = {
    listCategories: vi.fn(() => Promise.resolve(structuredClone(categories))),
    createCategory: vi.fn((input: Parameters<CategoryRepository['createCategory']>[0]) => {
      const category: Category = {
        id: nextId('category'),
        aliases: [],
        importantByDefault: false,
        urgencyDays: null,
        maxInProgress: null,
        archivedAt: null,
        subcategories: [],
        ...input,
      }
      categories = [...categories, category]
      return Promise.resolve(structuredClone(category))
    }),
    updateCategory: vi.fn((id: string, changes: Partial<Category>) => {
      categories = categories.map((category) =>
        category.id === id ? { ...category, ...changes } : category,
      )
      return Promise.resolve()
    }),
    createSubcategory: vi.fn((input: Parameters<CategoryRepository['createSubcategory']>[0]) => {
      const subcategory: Subcategory = {
        id: nextId('subcategory'),
        aliases: [],
        archivedAt: null,
        ...input,
      }
      categories = categories.map((category) =>
        category.id === input.categoryId
          ? { ...category, subcategories: [...category.subcategories, subcategory] }
          : category,
      )
      return Promise.resolve(structuredClone(subcategory))
    }),
    updateSubcategory: vi.fn((id: string, changes: Partial<Subcategory>) => {
      categories = categories.map((category) => ({
        ...category,
        subcategories: category.subcategories.map((subcategory) =>
          subcategory.id === id ? { ...subcategory, ...changes } : subcategory,
        ),
      }))
      return Promise.resolve()
    }),
  } satisfies CategoryRepository

  return repository
}

export function createFakeTaskRepository(initial: Task[] = []) {
  let tasks = structuredClone(initial)
  let sequence = 0
  const nextId = (prefix: string) => {
    sequence += 1
    return `${prefix}-${String(sequence)}`
  }
  const withTask = (id: string, update: (task: Task) => Task) => {
    tasks = tasks.map((task) => (task.id === id ? update(task) : task))
  }

  const repository = {
    listTasks: vi.fn(() => Promise.resolve(structuredClone(tasks))),
    createTask: vi.fn((input: Parameters<TaskRepository['createTask']>[0]) => {
      const task: Task = {
        ...input,
        id: nextId('task'),
        completedAt: input.status === 'done' ? new Date().toISOString() : null,
        createdAt: new Date().toISOString(),
        checklist: [],
      }
      tasks = [...tasks, task]
      return Promise.resolve(structuredClone(task))
    }),
    updateTask: vi.fn((id: string, changes: Parameters<TaskRepository['updateTask']>[1]) => {
      withTask(id, (task) => ({
        ...task,
        ...changes,
        completedAt:
          changes.status === undefined
            ? task.completedAt
            : changes.status === 'done'
              ? (task.completedAt ?? new Date().toISOString())
              : null,
      }))
      return Promise.resolve()
    }),
    deleteTask: vi.fn((id: string) => {
      tasks = tasks.filter((task) => task.id !== id)
      return Promise.resolve()
    }),
    addChecklistItem: vi.fn((input: Parameters<TaskRepository['addChecklistItem']>[0]) => {
      const item = { id: nextId('item'), isDone: false, ...input }
      withTask(input.taskId, (task) => ({ ...task, checklist: [...task.checklist, item] }))
      return Promise.resolve(structuredClone(item))
    }),
    updateChecklistItem: vi.fn(
      (id: string, changes: Parameters<TaskRepository['updateChecklistItem']>[1]) => {
        tasks = tasks.map((task) => ({
          ...task,
          checklist: task.checklist.map((item) =>
            item.id === id ? { ...item, ...changes } : item,
          ),
        }))
        return Promise.resolve()
      },
    ),
    deleteChecklistItem: vi.fn((id: string) => {
      tasks = tasks.map((task) => ({
        ...task,
        checklist: task.checklist.filter((item) => item.id !== id),
      }))
      return Promise.resolve()
    }),
  } satisfies TaskRepository

  return repository
}
