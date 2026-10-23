import { isAuthError, type Session } from '@supabase/supabase-js'
import type { AppSupabaseClient } from '@/shared/lib/supabase'
import { AuthError, type AuthErrorReason } from '../domain/authError'
import type { AuthSession } from '../domain/session'
import type { AuthRepository } from './authRepository'

const HTTP_TOO_MANY_REQUESTS = 429

const REASON_BY_CODE: Record<string, AuthErrorReason> = {
  otp_expired: 'invalid_code',
  over_email_send_rate_limit: 'too_many_requests',
  over_request_rate_limit: 'too_many_requests',
  provider_disabled: 'provider_disabled',
  email_provider_disabled: 'provider_disabled',
}

export function toAuthError(error: unknown): AuthError {
  if (!isAuthError(error)) {
    return new AuthError('unknown')
  }
  const reason = error.code ? REASON_BY_CODE[error.code] : undefined
  if (reason) {
    return new AuthError(reason)
  }
  if (error.status === HTTP_TOO_MANY_REQUESTS) {
    return new AuthError('too_many_requests')
  }
  if (error.name === 'AuthRetryableFetchError') {
    return new AuthError('network')
  }
  return new AuthError('unknown')
}

function toAuthSession(session: Session): AuthSession {
  return { userId: session.user.id, email: session.user.email ?? null }
}

export function createSupabaseAuthRepository(client: AppSupabaseClient): AuthRepository {
  return {
    async getSession() {
      const { data, error } = await client.auth.getSession()
      if (error) {
        throw toAuthError(error)
      }
      return data.session ? toAuthSession(data.session) : null
    },
    async sendSignInCode(email) {
      const { error } = await client.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      })
      if (error) {
        throw toAuthError(error)
      }
    },
    async verifySignInCode(email, code) {
      const { data, error } = await client.auth.verifyOtp({ email, token: code, type: 'email' })
      if (error) {
        throw toAuthError(error)
      }
      if (!data.session) {
        throw new AuthError('unknown')
      }
      return toAuthSession(data.session)
    },
    async signInWithGoogle(redirectPath) {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: new URL(redirectPath, window.location.origin).toString() },
      })
      if (error) {
        throw toAuthError(error)
      }
    },
    async signOut() {
      const { error } = await client.auth.signOut()
      if (error) {
        throw toAuthError(error)
      }
    },
    onSignedOut(listener) {
      const { data } = client.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') {
          setTimeout(listener, 0)
        }
      })
      return () => {
        data.subscription.unsubscribe()
      }
    },
  }
}
