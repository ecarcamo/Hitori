import type { Category } from './category'
import {
  addAlias,
  nextAvailableTone,
  normalizeAlias,
  summarizeCategory,
  validateName,
} from './categoryRules'

function category(overrides: Partial<Category> = {}): Category {
  return {
    id: 'c1',
    name: 'U',
    tone: 1,
    aliases: [],
    sortOrder: 'a0',
    importantByDefault: true,
    urgencyDays: null,
    maxInProgress: null,
    archivedAt: null,
    subcategories: [],
    ...overrides,
  }
}

describe('validateName', () => {
  it('accepts a new name', () => {
    expect(validateName('  Trabajo ', ['U'])).toBeNull()
  })

  it('rejects blank names', () => {
    expect(validateName('   ', [])).toBe('Escribe un nombre.')
  })

  it('rejects names already taken, ignoring capitals', () => {
    expect(validateName('trabajo', ['Trabajo'])).toBe('Ya existe con ese nombre.')
  })

  it('rejects very long names', () => {
    expect(validateName('a'.repeat(61), [])).toMatch(/60 caracteres/)
  })
})

describe('aliases', () => {
  it('are lowercase single words', () => {
    expect(normalizeAlias('  Ing Soft ')).toBe('ingsoft')
  })

  it('are added once', () => {
    expect(addAlias(['iot'], 'IngSoft')).toEqual(['iot', 'ingsoft'])
    expect(addAlias(['ingsoft'], 'INGSOFT')).toBeNull()
    expect(addAlias([], '   ')).toBeNull()
  })
})

describe('nextAvailableTone', () => {
  it('picks the first tone nobody uses', () => {
    expect(nextAvailableTone([category({ tone: 1 }), category({ tone: 2 })])).toBe(3)
  })

  it('ignores archived categories', () => {
    expect(nextAvailableTone([category({ tone: 1, archivedAt: '2026-10-22T00:00:00Z' })])).toBe(1)
  })

  it('cycles when every tone is taken', () => {
    const all = [1, 2, 3, 4, 5, 6, 7, 8] as const
    expect(nextAvailableTone(all.map((tone) => category({ tone })))).toBe(1)
  })
})

describe('summarizeCategory', () => {
  it('describes how the tasks behave', () => {
    expect(
      summarizeCategory(
        category({ urgencyDays: 1, maxInProgress: 2, aliases: ['ingsoft', 'iot'] }),
      ),
    ).toBe('Importante por defecto · urgente a 1 día · máximo 2 en curso · alias: ingsoft, iot')
  })

  it('falls back to the profile urgency', () => {
    expect(summarizeCategory(category({ importantByDefault: false }))).toBe(
      'No importante por defecto · urgente según tu perfil',
    )
  })
})
