import { vi } from 'vitest'
import type { AuthRepository, AuthSession } from '@/features/auth'
import type { Category, CategoryRepository, Subcategory } from '@/features/categories'
import type { Profile, ProfileRepository } from '@/features/profile'

export const TEST_SESSION: AuthSession = { userId: 'user-1', email: 'ana@hitori.test' }

export const ONBOARDED_PROFILE: Profile = {
  id: 'user-1',
  displayName: 'Ana',
  timezone: 'America/Guatemala',
  onboardedAt: '2026-10-22T18:00:00Z',
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
      const subcategory: Subcategory = { id: nextId('subcategory'), archivedAt: null, ...input }
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
