import { vi } from 'vitest'
import type { AuthRepository, AuthSession } from '@/features/auth'
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
