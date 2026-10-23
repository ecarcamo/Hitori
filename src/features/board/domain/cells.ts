import { TASK_STATUSES, type Task, type TaskStatus } from '@/features/tasks'
import type { Board } from './boardLayout'
import { cellKeyOf } from './placement'

export function cellsOf(board: Board, statuses: readonly TaskStatus[] = TASK_STATUSES) {
  const cells: Record<string, readonly Task[]> = {}
  for (const lane of board.lanes) {
    for (const status of statuses) {
      cells[cellKeyOf(lane.category.id, status)] = lane.cells[status]
    }
  }
  return cells
}
