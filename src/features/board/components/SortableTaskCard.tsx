import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ComponentProps } from 'react'
import { TaskCard } from '@/features/tasks'
import { cx } from '@/shared/lib/cx'
import { Icon } from '@/shared/ui'
import { DRAG_HANDLE_ATTRIBUTE } from '../hooks/handleKeyboardSensor'
import styles from './BoardPage.module.css'

type SortableTaskCardProps = ComponentProps<typeof TaskCard>

export function SortableTaskCard(props: SortableTaskCardProps) {
  const { task } = props
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  return (
    <div
      ref={setNodeRef}
      className={cx(styles.sortable, isDragging && styles.dragging)}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...listeners}
    >
      <TaskCard {...props} />
      <button
        ref={setActivatorNodeRef}
        type="button"
        className={styles.dragHandle}
        aria-label={`Mover ${task.title}`}
        {...{ [DRAG_HANDLE_ATTRIBUTE]: '' }}
        {...attributes}
        tabIndex={0}
      >
        <Icon name="grip" />
      </button>
    </div>
  )
}
