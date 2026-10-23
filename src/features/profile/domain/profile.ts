export const DISPLAY_NAME_MAX_LENGTH = 80

export interface Profile {
  id: string
  displayName: string | null
  timezone: string
  onboardedAt: string | null
  maxInProgress: number
  urgencyDays: number
}

export interface ProfileChanges {
  displayName?: string | null
  timezone?: string
  onboardedAt?: string
}

export function isOnboarded(profile: Profile) {
  return profile.onboardedAt !== null
}

export function normalizeDisplayName(value: string) {
  const trimmed = value.trim().replace(/\s+/g, ' ').slice(0, DISPLAY_NAME_MAX_LENGTH)
  return trimmed === '' ? null : trimmed
}
