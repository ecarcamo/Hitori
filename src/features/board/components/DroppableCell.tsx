import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import styles from './BoardPage.module.css'

interface DroppableCellProps {
  id: string
  itemIds: readonly string[]
  className?: string | undefined
  children: ReactNode
}

export function DroppableCell({ id, itemIds, className, children }: DroppableCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <SortableContext id={id} items={[...itemIds]} strategy={verticalListSortingStrategy}>
      <div ref={setNodeRef} className={cx(className, isOver && styles.over)}>
        {children}
      </div>
    </SortableContext>
  )
}
