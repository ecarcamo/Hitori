import { generateKeyBetween, generateNKeysBetween } from 'fractional-indexing'

interface Placeable {
  id: string
  sortOrder: string
}

export interface Placement {
  sortOrder: string
  rebalanced: Placeable[]
}

export function placeAt(neighbors: readonly Placeable[], index: number): Placement {
  const before = neighbors[index - 1]?.sortOrder ?? null
  const after = neighbors[index]?.sortOrder ?? null
  if (before === null || after === null || before < after) {
    return { sortOrder: generateKeyBetween(before, after), rebalanced: [] }
  }
  const keys = generateNKeysBetween(null, null, neighbors.length + 1)
  const keyAt = (position: number) => keys[position] ?? generateKeyBetween(null, null)
  return {
    sortOrder: keyAt(index),
    rebalanced: neighbors.map((neighbor, position) => ({
      id: neighbor.id,
      sortOrder: keyAt(position >= index ? position + 1 : position),
    })),
  }
}

export interface CellKey {
  categoryId: string
  status: string
}

const SEPARATOR = '::'

export function cellKeyOf(categoryId: string, status: string) {
  return `${categoryId}${SEPARATOR}${status}`
}

export function parseCellKey(key: string): CellKey | null {
  const [categoryId, status] = key.split(SEPARATOR)
  return categoryId && status ? { categoryId, status } : null
}

export type CellMap = Record<string, readonly Placeable[]>

export function containerOf(cells: CellMap, id: string) {
  if (id in cells) {
    return id
  }
  return Object.keys(cells).find((key) => cells[key]?.some((item) => item.id === id)) ?? null
}

export function moveAcross<T extends Placeable>(
  cells: Record<string, readonly T[]>,
  activeId: string,
  overId: string,
): Record<string, readonly T[]> {
  const from = containerOf(cells, activeId)
  const to = containerOf(cells, overId)
  if (!from || !to || from === to) {
    return cells
  }
  const source = cells[from] ?? []
  const target = cells[to] ?? []
  const moving = source.find((item) => item.id === activeId)
  if (!moving) {
    return cells
  }
  const overIndex = target.findIndex((item) => item.id === overId)
  const insertAt = overIndex === -1 ? target.length : overIndex
  return {
    ...cells,
    [from]: source.filter((item) => item.id !== activeId),
    [to]: [...target.slice(0, insertAt), moving, ...target.slice(insertAt)],
  }
}

export function moveWithin<T extends Placeable>(
  cells: Record<string, readonly T[]>,
  activeId: string,
  overId: string,
): Record<string, readonly T[]> {
  const container = containerOf(cells, activeId)
  if (!container || container !== containerOf(cells, overId)) {
    return cells
  }
  const items = [...(cells[container] ?? [])]
  const from = items.findIndex((item) => item.id === activeId)
  const to = items.findIndex((item) => item.id === overId)
  if (from === -1 || to === -1 || from === to) {
    return cells
  }
  const [moving] = items.splice(from, 1)
  if (!moving) {
    return cells
  }
  items.splice(to, 0, moving)
  return { ...cells, [container]: items }
}
