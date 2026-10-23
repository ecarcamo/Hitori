import { DndContext, DragOverlay, type Announcements, type UniqueIdentifier } from '@dnd-kit/core'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { Task } from '@/features/tasks'
import { containerOf } from '../domain/placement'
import { boardCollisionDetection } from '../hooks/boardCollisionDetection'
import { useBoardDrag, type TaskCells, type TaskMove } from '../hooks/useBoardDrag'
import styles from './BoardPage.module.css'

const INSTRUCTIONS =
  'Para mover una tarea, enfoca su asa y presiona espacio o Enter. Usa las flechas para cambiar de lugar, de columna o de carril, y vuelve a presionar espacio o Enter para soltarla. Escape cancela.'

interface BoardDndProps {
  cells: TaskCells
  cellLabel: (cellKey: string) => string
  onMove: (move: TaskMove) => void
  renderOverlay: (task: Task) => ReactNode
  children: (cells: TaskCells) => ReactNode
}

export function BoardDnd({ cells, cellLabel, onMove, renderOverlay, children }: BoardDndProps) {
  const drag = useBoardDrag(cells, onMove)

  const titleOf = (id: UniqueIdentifier) =>
    Object.values(drag.cells)
      .flat()
      .find((task) => task.id === id)?.title ?? 'la tarea'

  const placeOf = (id: UniqueIdentifier | undefined) => {
    const container = id === undefined ? null : containerOf(drag.cells, String(id))
    return container ? cellLabel(container) : 'fuera del tablero'
  }

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Tomaste ${titleOf(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over ? `${titleOf(active.id)} está en ${placeOf(over.id)}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `Soltaste ${titleOf(active.id)} en ${placeOf(over.id)}.`
        : `Soltaste ${titleOf(active.id)} sin moverla.`,
    onDragCancel: ({ active }) => `Cancelaste el movimiento de ${titleOf(active.id)}.`,
  }

  return (
    <DndContext
      sensors={drag.sensors}
      collisionDetection={boardCollisionDetection}
      accessibility={{ announcements, screenReaderInstructions: { draggable: INSTRUCTIONS } }}
      {...drag.handlers}
    >
      {children(drag.cells)}
      {createPortal(
        <DragOverlay>
          {drag.activeTask ? (
            <div className={styles.overlay}>{renderOverlay(drag.activeTask)}</div>
          ) : null}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  )
}
