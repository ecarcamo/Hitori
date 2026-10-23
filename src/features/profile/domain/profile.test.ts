import { isOnboarded, normalizeDisplayName } from './profile'

describe('normalizeDisplayName', () => {
  it('trims and collapses spaces', () => {
    expect(normalizeDisplayName('  Ana   María ')).toBe('Ana María')
  })

  it('treats blank names as missing', () => {
    expect(normalizeDisplayName('   ')).toBeNull()
  })

  it('caps the length', () => {
    expect(normalizeDisplayName('a'.repeat(120))).toHaveLength(80)
  })
})

describe('isOnboarded', () => {
  it('depends on the onboarding date', () => {
    const base = { id: 'u1', displayName: null, timezone: 'UTC', maxInProgress: 3, urgencyDays: 3 }
    expect(isOnboarded({ ...base, onboardedAt: null })).toBe(false)
    expect(isOnboarded({ ...base, onboardedAt: '2026-10-22T18:00:00Z' })).toBe(true)
  })
})
