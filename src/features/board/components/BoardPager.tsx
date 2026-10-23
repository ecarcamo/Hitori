import { useState } from 'react'
import {
  quadrantOf,
  STATUS_LABELS,
  TASK_STATUSES,
  TaskCard,
  type TaskStatus,
} from '@/features/tasks'
import { CategoryDot, SegmentedControl, WipMeter } from '@/shared/ui'
import { laneAnchorId, type Board } from '../domain/boardLayout'
import { cellsOf } from '../domain/cells'
import { cellKeyOf, parseCellKey } from '../domain/placement'
import type { TaskMove } from '../hooks/useBoardDrag'
import { BoardDnd } from './BoardDnd'
import styles from './BoardPage.module.css'
import { BoardTaskList } from './BoardTaskList'
import { DroppableCell } from './DroppableCell'

interface BoardPagerProps {
  board: Board
  inProgressLimit: number
  timezone: string
  urgencyDays: number
  now: Date
  onOpen: (taskId: string) => void
  onMove: (move: TaskMove) => void
}

export function BoardPager({
  board,
  inProgressLimit,
  timezone,
  urgencyDays,
  now,
  onOpen,
  onMove,
}: BoardPagerProps) {
  const [status, setStatus] = useState<TaskStatus>('todo')
  const options = TASK_STATUSES.map((value) => ({
    value,
    label: `${STATUS_LABELS[value]} ${String(board.totals[value])}`,
  }))
  const isEmpty = board.totals[status] === 0

  const cellLabel = (cellKey: string) => {
    const lane = board.lanes.find((item) => item.category.id === parseCellKey(cellKey)?.categoryId)
    return lane ? `${lane.category.name} · ${STATUS_LABELS[status]}` : 'otro carril'
  }

  return (
    <section className={styles.pager} aria-label="Tablero por estado">
      <SegmentedControl
        label="Columna"
        options={options}
        value={status}
        fullWidth
        onChange={setStatus}
      />
      {status === 'in_progress' ? (
        <p className={styles.pagerWip}>
          En curso {board.totals.in_progress} de {inProgressLimit}
          <WipMeter used={board.totals.in_progress} limit={inProgressLimit} />
        </p>
      ) : null}
      {isEmpty ? <p className={styles.empty}>No hay tareas aquí.</p> : null}
      <BoardDnd
        cells={cellsOf(board, [status])}
        cellLabel={cellLabel}
        onMove={onMove}
        renderOverlay={(task) => (
          <TaskCard
            task={task}
            quadrant={quadrantOf(task, now, urgencyDays, timezone)}
            subcategoryName={null}
            timezone={timezone}
            now={now}
            isLit
            onOpen={onOpen}
          />
        )}
      >
        {(cells) =>
          board.lanes.map((lane) => {
            const key = cellKeyOf(lane.category.id, status)
            const tasks = cells[key] ?? []
            if (isEmpty) {
              return null
            }
            return (
              <DroppableCell
                key={lane.category.id}
                id={key}
                itemIds={tasks.map((task) => task.id)}
                className={styles.pagerLane}
              >
                <h3 id={laneAnchorId(lane.category.id)} className={styles.laneHeader}>
                  <CategoryDot tone={lane.category.tone} />
                  {lane.category.name}
                </h3>
                <BoardTaskList
                  label={cellLabel(key)}
                  tasks={tasks}
                  category={lane.category}
                  timezone={timezone}
                  urgencyDays={urgencyDays}
                  now={now}
                  isLit={status === 'in_progress'}
                  emptyText="Suelta aquí para moverla a este carril"
                  onOpen={onOpen}
                />
              </DroppableCell>
            )
          })
        }
      </BoardDnd>
    </section>
  )
}
