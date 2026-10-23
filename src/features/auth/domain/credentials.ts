import { z } from 'zod/mini'

export const SIGN_IN_CODE_LENGTH = 6

const emailSchema = z.email()
const completeCodePattern = new RegExp(`^\\d{${String(SIGN_IN_CODE_LENGTH)}}$`)

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

export function isValidEmail(value: string) {
  return emailSchema.safeParse(normalizeEmail(value)).success
}

export function sanitizeSignInCode(value: string) {
  return value.replace(/\D/g, '').slice(0, SIGN_IN_CODE_LENGTH)
}

export function isCompleteSignInCode(value: string) {
  return completeCodePattern.test(value)
}
