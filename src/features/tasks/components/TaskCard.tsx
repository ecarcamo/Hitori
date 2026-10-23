import { cx } from '@/shared/lib/cx'
import { QuadrantGlyph } from '@/shared/ui'
import type { QuadrantId } from '@/shared/ui'
import { formatDue } from '../domain/dueDate'
import type { Task } from '../domain/task'
import { overdueLabel, QUADRANT_LABELS } from '../domain/taskRules'
import { formatDuration } from '../domain/formatDuration'
import styles from './TaskCard.module.css'

interface TaskCardProps {
  task: Task
  quadrant: QuadrantId
  subcategoryName: string | null
  timezone: string
  now: Date
  isLit?: boolean
  onOpen: (taskId: string) => void
}

export function TaskCard({
  task,
  quadrant,
  subcategoryName,
  timezone,
  now,
  isLit = false,
  onOpen,
}: TaskCardProps) {
  const late = overdueLabel(task, now, timezone)
  const doneChecklist = task.checklist.filter((item) => item.isDone).length
  const details = [
    subcategoryName,
    task.dueAt && !late ? formatDue(task.dueAt, now, timezone) : null,
    task.durationMin ? formatDuration(task.durationMin) : null,
    task.checklist.length > 0 ? `${String(doneChecklist)}/${String(task.checklist.length)}` : null,
  ].filter(Boolean)

  if (task.status === 'done') {
    return (
      <button
        type="button"
        className={cx(styles.card, styles.done)}
        onClick={() => {
          onOpen(task.id)
        }}
      >
        <strong className={styles.title}>{task.title}</strong>
      </button>
    )
  }

  if (task.status === 'waiting') {
    return (
      <button
        type="button"
        className={cx(styles.card, styles.waiting)}
        onClick={() => {
          onOpen(task.id)
        }}
      >
        <strong className={styles.title}>{task.title}</strong>
        <small className={styles.meta}>
          {task.blockedBy ? `Esperando a ${task.blockedBy}` : 'Esperando'}
        </small>
      </button>
    )
  }

  return (
    <button
      type="button"
      className={cx(styles.card, isLit && styles.lit)}
      onClick={() => {
        onOpen(task.id)
      }}
    >
      <span className={styles.top}>
        <QuadrantGlyph quadrant={quadrant} label={QUADRANT_LABELS[quadrant]} />
        <strong className={styles.title}>{task.title}</strong>
      </span>
      {late || details.length > 0 ? (
        <small className={styles.meta}>
          {late ? <span className={styles.hot}>{late}</span> : null}
          {late && details.length > 0 ? ' · ' : null}
          {details.join(' · ')}
        </small>
      ) : null}
    </button>
  )
}
