import { useState } from 'react'
import { STATUS_LABELS, TASK_STATUSES, type TaskStatus } from '@/features/tasks'
import { CategoryDot, SegmentedControl, WipMeter } from '@/shared/ui'
import { laneAnchorId, type Board } from '../domain/boardLayout'
import styles from './BoardPage.module.css'
import { BoardTaskList } from './BoardTaskList'

interface BoardPagerProps {
  board: Board
  inProgressLimit: number
  timezone: string
  urgencyDays: number
  now: Date
  onOpen: (taskId: string) => void
}

export function BoardPager({
  board,
  inProgressLimit,
  timezone,
  urgencyDays,
  now,
  onOpen,
}: BoardPagerProps) {
  const [status, setStatus] = useState<TaskStatus>('todo')
  const lanes = board.lanes.filter((lane) => lane.cells[status].length > 0)
  const options = TASK_STATUSES.map((value) => ({
    value,
    label: `${STATUS_LABELS[value]} ${String(board.totals[value])}`,
  }))

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
      {lanes.length === 0 ? <p className={styles.empty}>No hay tareas aquí.</p> : null}
      {lanes.map((lane) => (
        <div key={lane.category.id} className={styles.pagerLane}>
          <h3 id={laneAnchorId(lane.category.id)} className={styles.laneHeader}>
            <CategoryDot tone={lane.category.tone} />
            {lane.category.name}
          </h3>
          <BoardTaskList
            label={`${lane.category.name} · ${STATUS_LABELS[status]}`}
            tasks={lane.cells[status]}
            category={lane.category}
            timezone={timezone}
            urgencyDays={urgencyDays}
            now={now}
            isLit={status === 'in_progress'}
            emptyText=""
            onOpen={onOpen}
          />
        </div>
      ))}
    </section>
  )
}
