import type { KeyboardCoordinateGetter, Over } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { TASK_STATUSES } from '@/features/tasks'
import { cellKeyOf, parseCellKey } from '../domain/placement'

const COLUMN_STEP: Readonly<Record<string, number>> = { ArrowRight: 1, ArrowLeft: -1 }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function cellKeyUnder(over: Over | null) {
  if (!over) {
    return null
  }
  const id = String(over.id)
  if (parseCellKey(id)) {
    return id
  }
  const data: unknown = over.data.current
  if (isRecord(data) && isRecord(data.sortable)) {
    const containerId = data.sortable.containerId
    return typeof containerId === 'string' ? containerId : null
  }
  return null
}

export const boardKeyboardCoordinates: KeyboardCoordinateGetter = (event, args) => {
  const step = COLUMN_STEP[event.code]
  if (step === undefined) {
    return sortableKeyboardCoordinates(event, args)
  }
  event.preventDefault()
  const { context, currentCoordinates } = args
  const cell = parseCellKey(cellKeyUnder(context.over) ?? '')
  const nextStatus =
    TASK_STATUSES[TASK_STATUSES.findIndex((status) => status === cell?.status) + step]
  const target =
    cell && nextStatus
      ? context.droppableRects.get(cellKeyOf(cell.categoryId, nextStatus))
      : undefined
  const { collisionRect } = context
  if (!target || !collisionRect) {
    return currentCoordinates
  }
  return { x: target.left + (target.width - collisionRect.width) / 2, y: target.top }
}
