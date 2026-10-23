import {
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useState } from 'react'
import { TASK_STATUSES, type Task, type TaskStatus } from '@/features/tasks'
import { containerOf, moveAcross, moveWithin, parseCellKey, placeAt } from '../domain/placement'
import { boardKeyboardCoordinates } from './boardKeyboardCoordinates'
import { HandleKeyboardSensor } from './handleKeyboardSensor'

const MOUSE_DISTANCE = 6
const TOUCH_DELAY_MS = 250
const TOUCH_TOLERANCE = 8

export type TaskCells = Record<string, readonly Task[]>

export interface TaskMove {
  taskId: string
  categoryId: string
  status: TaskStatus
  sortOrder: string
  categoryChanged: boolean
  rebalanced: { id: string; sortOrder: string }[]
}

function isTaskStatus(value: string): value is TaskStatus {
  return TASK_STATUSES.some((status) => status === value)
}

function resolveMove(cells: TaskCells, task: Task, originalCells: TaskCells): TaskMove | null {
  const container = containerOf(cells, task.id)
  const cell = container ? parseCellKey(container) : null
  if (!container || !cell || !isTaskStatus(cell.status)) {
    return null
  }
  const items = cells[container] ?? []
  const index = items.findIndex((item) => item.id === task.id)
  const originalContainer = containerOf(originalCells, task.id)
  const originalIndex = (originalCells[originalContainer ?? ''] ?? []).findIndex(
    (item) => item.id === task.id,
  )
  if (container === originalContainer && index === originalIndex) {
    return null
  }
  const neighbors = items.filter((item) => item.id !== task.id)
  const placement = placeAt(neighbors, index)
  return {
    taskId: task.id,
    categoryId: cell.categoryId,
    status: cell.status,
    sortOrder: placement.sortOrder,
    categoryChanged: cell.categoryId !== task.categoryId,
    rebalanced: placement.rebalanced,
  }
}

export function useBoardDrag(cells: TaskCells, onMove: (move: TaskMove) => void) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [preview, setPreview] = useState<TaskCells | null>(null)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: MOUSE_DISTANCE } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: TOUCH_DELAY_MS, tolerance: TOUCH_TOLERANCE },
    }),
    useSensor(HandleKeyboardSensor, { coordinateGetter: boardKeyboardCoordinates }),
  )

  const reset = () => {
    setActiveId(null)
    setPreview(null)
  }

  const activeTask = activeId
    ? Object.values(cells)
        .flat()
        .find((task) => task.id === activeId)
    : undefined

  return {
    sensors,
    cells: preview ?? cells,
    activeTask,
    handlers: {
      onDragStart: ({ active }: DragStartEvent) => {
        setActiveId(String(active.id))
        setPreview(cells)
      },
      onDragOver: ({ active, over }: DragOverEvent) => {
        if (!over) {
          return
        }
        setPreview((current) => moveAcross(current ?? cells, String(active.id), String(over.id)))
      },
      onDragEnd: ({ active, over }: DragEndEvent) => {
        const task = activeTask
        const finalCells = over
          ? moveWithin(preview ?? cells, String(active.id), String(over.id))
          : null
        reset()
        if (!task || !finalCells) {
          return
        }
        const move = resolveMove(finalCells, task, cells)
        if (move) {
          onMove(move)
        }
      },
      onDragCancel: reset,
    },
  }
}
