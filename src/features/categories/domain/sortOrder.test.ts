import { bySortOrder, sortOrderAfter, sortOrderForMove } from './sortOrder'

const items = (...keys: string[]) => keys.map((sortOrder) => ({ sortOrder }))

function orderAfterMove(keys: string[], fromIndex: number, toIndex: number) {
  const list = items(...keys).map((item, index) => ({ ...item, name: String(index) }))
  const key = sortOrderForMove(list, fromIndex, toIndex)
  if (!key) {
    return list.map((item) => item.name)
  }
  const moved = list.map((item, index) =>
    index === fromIndex ? { ...item, sortOrder: key } : item,
  )
  return moved.sort(bySortOrder).map((item) => item.name)
}

describe('sortOrderAfter', () => {
  it('starts the list when it is empty', () => {
    expect(sortOrderAfter([])).toBe('a0')
  })

  it('goes after the last item', () => {
    const key = sortOrderAfter(items('a0', 'a2', 'a1'))
    expect(key > 'a2').toBe(true)
  })
})

describe('sortOrderForMove', () => {
  it('moves an item down', () => {
    expect(orderAfterMove(['a0', 'a1', 'a2', 'a3'], 0, 2)).toEqual(['1', '2', '0', '3'])
  })

  it('moves an item to the top', () => {
    expect(orderAfterMove(['a0', 'a1', 'a2'], 2, 0)).toEqual(['2', '0', '1'])
  })

  it('moves an item to the end', () => {
    expect(orderAfterMove(['a0', 'a1', 'a2'], 0, 2)).toEqual(['1', '2', '0'])
  })

  it('does nothing when the item stays in place', () => {
    expect(sortOrderForMove(items('a0', 'a1'), 1, 1)).toBeNull()
  })

  it('compares keys byte by byte like the database', () => {
    const sorted = items('a1', 'Zz', 'a0V').sort(bySortOrder)
    expect(sorted.map((item) => item.sortOrder)).toEqual(['Zz', 'a0V', 'a1'])
  })
})
