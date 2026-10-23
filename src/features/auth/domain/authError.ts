export type AuthErrorReason =
  'invalid_code' | 'too_many_requests' | 'provider_disabled' | 'network' | 'unknown'

export const AUTH_ERROR_MESSAGES: Record<AuthErrorReason, string> = {
  invalid_code: 'El código no es correcto o ya venció. Revísalo o pide uno nuevo.',
  too_many_requests: 'Pediste muchos códigos seguidos. Espera un momento y vuelve a intentar.',
  provider_disabled: 'Esta forma de entrar todavía no está disponible.',
  network: 'No hay conexión. Revisa tu internet y vuelve a intentar.',
  unknown: 'Algo salió mal. Vuelve a intentar en un momento.',
}

export class AuthError extends Error {
  readonly reason: AuthErrorReason

  constructor(reason: AuthErrorReason) {
    super(AUTH_ERROR_MESSAGES[reason])
    this.name = 'AuthError'
    this.reason = reason
  }
}

export function authErrorMessage(error: unknown) {
  return error instanceof AuthError ? error.message : AUTH_ERROR_MESSAGES.unknown
}
