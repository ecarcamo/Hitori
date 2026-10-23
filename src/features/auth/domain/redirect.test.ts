import { DEFAULT_AFTER_SIGN_IN, safeRedirectPath } from './redirect'

describe('safeRedirectPath', () => {
  it('keeps internal paths with their query', () => {
    expect(safeRedirectPath('/board?vista=semana')).toBe('/board?vista=semana')
  })

  it.each([
    undefined,
    42,
    'https://malicioso.com',
    '//malicioso.com',
    '/\\malicioso.com',
    'tablero',
    '/sign-in',
    '/sign-in?redirect=/now',
  ])('falls back to the default for %j', (value) => {
    expect(safeRedirectPath(value)).toBe(DEFAULT_AFTER_SIGN_IN)
  })
})
