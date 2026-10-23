import type { Category } from '@/features/categories'
import { quadrantOf, TaskCard, type Task } from '@/features/tasks'
import { subcategoryNameOf } from '../domain/boardLayout'
import styles from './BoardPage.module.css'

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
  if (tasks.length === 0) {
    return <p className={styles.empty}>{emptyText}</p>
  }

  return (
    <ul className={styles.cards} aria-label={label}>
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskCard
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
