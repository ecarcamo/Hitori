export const DEFAULT_AFTER_SIGN_IN = '/ahora'
export const SIGN_IN_PATH = '/entrar'

export function safeRedirectPath(value: unknown): string {
  if (typeof value !== 'string') {
    return DEFAULT_AFTER_SIGN_IN
  }
  const isInternalPath =
    value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\')
  if (!isInternalPath || value.startsWith(SIGN_IN_PATH)) {
    return DEFAULT_AFTER_SIGN_IN
  }
  return value
}
