import { generateKeyBetween } from 'fractional-indexing'

interface Sortable {
  sortOrder: string
}

export function bySortOrder(first: Sortable, second: Sortable) {
  if (first.sortOrder === second.sortOrder) {
    return 0
  }
  return first.sortOrder < second.sortOrder ? -1 : 1
}

export function sortOrderAfter(items: readonly Sortable[]) {
  const last = [...items].sort(bySortOrder).at(-1)
  return generateKeyBetween(last?.sortOrder ?? null, null)
}

export function sortOrderForMove(items: readonly Sortable[], fromIndex: number, toIndex: number) {
  const sorted = [...items].sort(bySortOrder)
  const moving = sorted[fromIndex]
  if (!moving || fromIndex === toIndex) {
    return null
  }
  const rest = sorted.filter((_, index) => index !== fromIndex)
  const before = rest[toIndex - 1]?.sortOrder ?? null
  const after = rest[toIndex]?.sortOrder ?? null
  return generateKeyBetween(before, after)
}
