import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js'
import { toAuthError } from './supabaseAuthRepository'

describe('toAuthError', () => {
  it('explains an expired or wrong code', () => {
    const error = new AuthApiError('Token has expired or is invalid', 403, 'otp_expired')
    expect(toAuthError(error).reason).toBe('invalid_code')
  })

  it('explains the email rate limit', () => {
    const error = new AuthApiError('Too many emails', 429, 'over_email_send_rate_limit')
    expect(toAuthError(error).reason).toBe('too_many_requests')
  })

  it('treats any 429 as too many requests', () => {
    expect(toAuthError(new AuthApiError('slow down', 429, undefined)).reason).toBe(
      'too_many_requests',
    )
  })

  it('recognizes network failures', () => {
    expect(toAuthError(new AuthRetryableFetchError('Failed to fetch', 0)).reason).toBe('network')
  })

  it('never leaks unexpected errors', () => {
    expect(toAuthError(new Error('boom')).reason).toBe('unknown')
  })
})
