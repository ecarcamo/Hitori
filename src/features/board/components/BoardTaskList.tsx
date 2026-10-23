import type { Category } from '@/features/categories'
import { quadrantOf, type Task } from '@/features/tasks'
import { subcategoryNameOf } from '../domain/boardLayout'
import styles from './BoardPage.module.css'
import { SortableTaskCard } from './SortableTaskCard'

interface BoardTaskListProps {
  label: string
  tasks: readonly Task[]
  category: Category
  timezone: string
  urgencyDays: number
  now: Date
  isLit: boolean
  emptyText: string
  onOpen: (taskId: string) => void
}

export function BoardTaskList({
  label,
  tasks,
  category,
  timezone,
  urgencyDays,
  now,
  isLit,
  emptyText,
  onOpen,
}: BoardTaskListProps) {
  return (
    <ul className={styles.cards} aria-label={label}>
      {tasks.length === 0 && emptyText ? <li className={styles.empty}>{emptyText}</li> : null}
      {tasks.map((task) => (
        <li key={task.id}>
          <SortableTaskCard
            task={task}
            quadrant={quadrantOf(task, now, category.urgencyDays ?? urgencyDays, timezone)}
            subcategoryName={subcategoryNameOf(category, task.subcategoryId)}
            timezone={timezone}
            now={now}
            isLit={isLit}
            onOpen={onOpen}
          />
        </li>
      ))}
    </ul>
  )
}
