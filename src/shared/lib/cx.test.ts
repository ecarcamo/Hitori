import { cx } from './cx'

describe('cx', () => {
  it('joins only the truthy class names', () => {
    expect(cx('card', false, undefined, 'lit', null, '')).toBe('card lit')
  })
})
