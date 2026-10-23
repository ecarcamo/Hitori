import { Fragment } from 'react'
import {
  quadrantOf,
  STATUS_LABELS,
  TASK_STATUSES,
  TaskCard,
  type TaskStatus,
} from '@/features/tasks'
import { cx } from '@/shared/lib/cx'
import { CategoryDot, Icon, WipMeter } from '@/shared/ui'
import { laneAnchorId, subcategoryNameOf, type Board } from '../domain/boardLayout'
import { cellsOf } from '../domain/cells'
import { cellKeyOf, parseCellKey } from '../domain/placement'
import type { TaskMove } from '../hooks/useBoardDrag'
import { BoardDnd } from './BoardDnd'
import styles from './BoardPage.module.css'
import { BoardTaskList } from './BoardTaskList'
import { DroppableCell } from './DroppableCell'

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
  onMove: (move: TaskMove) => void
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
  onMove,
}: BoardGridProps) {
  const lastLane = board.lanes.length - 1

  const cellLabel = (cellKey: string) => {
    const cell = parseCellKey(cellKey)
    const lane = board.lanes.find((item) => item.category.id === cell?.categoryId)
    const status = TASK_STATUSES.find((item) => item === cell?.status)
    return lane && status ? `${lane.category.name} · ${STATUS_LABELS[status]}` : 'otra celda'
  }

  return (
    <section className={styles.board} aria-label="Tablero por categoría">
      <BoardDnd
        cells={cellsOf(board)}
        cellLabel={cellLabel}
        onMove={onMove}
        renderOverlay={(task) => {
          const lane = board.lanes.find((item) => item.category.id === task.categoryId)
          return (
            <TaskCard
              task={task}
              quadrant={quadrantOf(task, now, lane?.category.urgencyDays ?? urgencyDays, timezone)}
              subcategoryName={lane ? subcategoryNameOf(lane.category, task.subcategoryId) : null}
              timezone={timezone}
              now={now}
              isLit
              onOpen={onOpen}
            />
          )
        }}
      >
        {(cells) => (
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
                {TASK_STATUSES.map((status) => {
                  const key = cellKeyOf(lane.category.id, status)
                  const tasks = cells[key] ?? []
                  return (
                    <DroppableCell
                      key={status}
                      id={key}
                      itemIds={tasks.map((task) => task.id)}
                      className={cx(
                        styles.cell,
                        status === 'in_progress' && styles.lit,
                        status === 'in_progress' && index === lastLane && styles.litBottom,
                      )}
                    >
                      <BoardTaskList
                        label={cellLabel(key)}
                        tasks={tasks}
                        category={lane.category}
                        timezone={timezone}
                        urgencyDays={urgencyDays}
                        now={now}
                        isLit={status === 'in_progress'}
                        emptyText={EMPTY_TEXT[status]}
                        onOpen={onOpen}
                      />
                    </DroppableCell>
                  )
                })}
              </Fragment>
            ))}
          </div>
        )}
      </BoardDnd>
    </section>
  )
}
