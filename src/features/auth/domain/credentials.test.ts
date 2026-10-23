import {
  isCompleteSignInCode,
  isValidEmail,
  normalizeEmail,
  sanitizeSignInCode,
} from './credentials'

describe('email', () => {
  it('normalizes spaces and capital letters', () => {
    expect(normalizeEmail('  Esteban@UVG.edu.gt ')).toBe('esteban@uvg.edu.gt')
  })

  it.each(['ana@hitori.app', ' Beto@Correo.com '])('accepts %j', (value) => {
    expect(isValidEmail(value)).toBe(true)
  })

  it.each(['', 'ana', 'ana@', '@hitori.app', 'ana @hitori.app'])('rejects %j', (value) => {
    expect(isValidEmail(value)).toBe(false)
  })
})

describe('sign-in code', () => {
  it('keeps only the first six digits', () => {
    expect(sanitizeSignInCode('12 34-56 78')).toBe('123456')
  })

  it('is complete only with six digits', () => {
    expect(isCompleteSignInCode('123456')).toBe(true)
    expect(isCompleteSignInCode('12345')).toBe(false)
    expect(isCompleteSignInCode('12345a')).toBe(false)
  })
})
