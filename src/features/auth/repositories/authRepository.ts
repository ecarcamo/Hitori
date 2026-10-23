import type { AuthSession } from '../domain/session'

export interface AuthRepository {
  getSession: () => Promise<AuthSession | null>
  sendSignInCode: (email: string) => Promise<void>
  verifySignInCode: (email: string, code: string) => Promise<AuthSession>
  signInWithGoogle: (redirectPath: string) => Promise<void>
  signOut: () => Promise<void>
  onSignedOut: (listener: () => void) => () => void
}
