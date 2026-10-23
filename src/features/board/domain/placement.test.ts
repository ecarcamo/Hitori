import { cellKeyOf, containerOf, moveAcross, moveWithin, parseCellKey, placeAt } from './placement'

const item = (id: string, sortOrder: string) => ({ id, sortOrder })

describe('placeAt', () => {
  it('puts the item between its neighbors', () => {
    const { sortOrder, rebalanced } = placeAt([item('a', 'a0'), item('b', 'a1')], 1)
    expect(sortOrder > 'a0' && sortOrder < 'a1').toBe(true)
    expect(rebalanced).toEqual([])
  })

  it('handles the start, the end and an empty cell', () => {
    expect(placeAt([item('a', 'a0')], 0).sortOrder < 'a0').toBe(true)
    expect(placeAt([item('a', 'a0')], 1).sortOrder > 'a0').toBe(true)
    expect(placeAt([], 0).sortOrder).toBe('a0')
  })

  it('rebalances the cell when two neighbors share a key', () => {
    const { sortOrder, rebalanced } = placeAt([item('a', 'a0'), item('b', 'a0')], 1)
    const order = [...rebalanced, { id: 'moved', sortOrder }]
      .sort((x, y) => (x.sortOrder < y.sortOrder ? -1 : 1))
      .map((entry) => entry.id)
    expect(order).toEqual(['a', 'moved', 'b'])
  })
})

describe('cell keys', () => {
  it('round-trip the lane and the status', () => {
    expect(parseCellKey(cellKeyOf('u', 'in_progress'))).toEqual({
      categoryId: 'u',
      status: 'in_progress',
    })
    expect(parseCellKey('nada')).toBeNull()
  })
})

describe('moving between cells', () => {
  const cells = {
    'u::todo': [item('a', 'a0'), item('b', 'a1')],
    'u::in_progress': [item('c', 'a0')],
    'w::todo': [],
  }

  it('finds the cell of a task or of an empty cell', () => {
    expect(containerOf(cells, 'c')).toBe('u::in_progress')
    expect(containerOf(cells, 'w::todo')).toBe('w::todo')
  })

  it('moves a task over another task of a different cell', () => {
    const next = moveAcross(cells, 'a', 'c')
    expect(next['u::todo']?.map((entry) => entry.id)).toEqual(['b'])
    expect(next['u::in_progress']?.map((entry) => entry.id)).toEqual(['a', 'c'])
  })

  it('moves a task into an empty cell', () => {
    expect(moveAcross(cells, 'b', 'w::todo')['w::todo']?.map((entry) => entry.id)).toEqual(['b'])
  })

  it('reorders inside the same cell', () => {
    expect(moveWithin(cells, 'a', 'b')['u::todo']?.map((entry) => entry.id)).toEqual(['b', 'a'])
  })
})
