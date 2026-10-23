import { Fragment } from 'react'
import { STATUS_LABELS, TASK_STATUSES, type TaskStatus } from '@/features/tasks'
import { cx } from '@/shared/lib/cx'
import { CategoryDot, Icon, WipMeter } from '@/shared/ui'
import { laneAnchorId, type Board } from '../domain/boardLayout'
import styles from './BoardPage.module.css'
import { BoardTaskList } from './BoardTaskList'

const EMPTY_TEXT: Record<TaskStatus, string> = {
  todo: 'Nada por hacer',
  in_progress: 'Espacio libre',
  waiting: 'Nada esperando',
  done: 'Nada todavía',
}

interface BoardGridProps {
  board: Board
  inProgressLimit: number
  timezone: string
  urgencyDays: number
  now: Date
  onOpen: (taskId: string) => void
  onAdd: (categoryId: string) => void
}

function columnCount(board: Board, status: TaskStatus) {
  return status === 'done'
    ? `${String(board.totals.done)} esta semana`
    : String(board.totals[status])
}

export function BoardGrid({
  board,
  inProgressLimit,
  timezone,
  urgencyDays,
  now,
  onOpen,
  onAdd,
}: BoardGridProps) {
  const lastLane = board.lanes.length - 1

  return (
    <section className={styles.board} aria-label="Tablero por categoría">
      <div className={styles.grid}>
        {TASK_STATUSES.map((status) => (
          <h2
            key={status}
            className={cx(styles.columnHeader, status === 'in_progress' && styles.litTop)}
          >
            {STATUS_LABELS[status]}
            <span className={styles.count}>
              {status === 'in_progress'
                ? `${String(board.totals.in_progress)} de ${String(inProgressLimit)}`
                : columnCount(board, status)}
            </span>
            {status === 'in_progress' ? (
              <WipMeter used={board.totals.in_progress} limit={inProgressLimit} />
            ) : null}
          </h2>
        ))}
        {board.lanes.map((lane, index) => (
          <Fragment key={lane.category.id}>
            <h3 id={laneAnchorId(lane.category.id)} className={styles.laneHeader}>
              <CategoryDot tone={lane.category.tone} />
              {lane.category.name}
              <button
                type="button"
                className={styles.addButton}
                aria-label={`Agregar tarea a ${lane.category.name}`}
                onClick={() => {
                  onAdd(lane.category.id)
                }}
              >
                <Icon name="plus" />
              </button>
            </h3>
            <span
              className={cx(styles.laneGap, styles.lit, index === lastLane && styles.litBottom)}
              aria-hidden="true"
            />
            <span className={styles.laneGap} aria-hidden="true" />
            <span className={styles.laneGap} aria-hidden="true" />
            {TASK_STATUSES.map((status) => (
              <div
                key={status}
                className={cx(
                  styles.cell,
                  status === 'in_progress' && styles.lit,
                  status === 'in_progress' && index === lastLane && styles.litBottom,
                )}
              >
                <BoardTaskList
                  label={`${lane.category.name} · ${STATUS_LABELS[status]}`}
                  tasks={lane.cells[status]}
                  category={lane.category}
                  timezone={timezone}
                  urgencyDays={urgencyDays}
                  now={now}
                  isLit={status === 'in_progress'}
                  emptyText={EMPTY_TEXT[status]}
                  onOpen={onOpen}
                />
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </section>
  )
}
