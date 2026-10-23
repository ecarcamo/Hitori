import { currentPathFor } from './legacyPaths'

describe('currentPathFor', () => {
  it.each([
    ['/entrar', '/sign-in'],
    ['/ahora', '/now'],
    ['/tablero/', '/board'],
    ['/ajustes/categorias', '/settings/categories'],
  ])('sends %s to %s', (legacy, current) => {
    expect(currentPathFor(legacy)).toBe(current)
  })

  it.each(['/', '/now', '/board', '/tablerox', '/ajustes/otra'])('leaves %s alone', (path) => {
    expect(currentPathFor(path)).toBeNull()
  })
})
