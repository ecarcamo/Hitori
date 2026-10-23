import { DEFAULT_APPEARANCE, parseAppearance, resolveMode } from './appearance'

describe('resolveMode', () => {
  it('keeps an explicit mode regardless of the system', () => {
    expect(resolveMode('light', true)).toBe('light')
    expect(resolveMode('dark', false)).toBe('dark')
  })

  it('follows the system when the preference is system', () => {
    expect(resolveMode('system', true)).toBe('dark')
    expect(resolveMode('system', false)).toBe('light')
  })
})

describe('parseAppearance', () => {
  it('accepts a valid preference', () => {
    expect(parseAppearance({ theme: 'acero', mode: 'system' })).toEqual({
      theme: 'acero',
      mode: 'system',
    })
  })

  it.each([undefined, null, 'templo', { theme: 'neon', mode: 'dark' }, { theme: 'verde' }])(
    'falls back to the default for %j',
    (value) => {
      expect(parseAppearance(value)).toEqual(DEFAULT_APPEARANCE)
    },
  )
})
