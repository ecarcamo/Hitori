export const DEFAULT_AFTER_SIGN_IN = '/now'
export const SIGN_IN_PATH = '/sign-in'

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
