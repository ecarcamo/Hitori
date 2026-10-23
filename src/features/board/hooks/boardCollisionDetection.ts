import {
  closestCenter,
  pointerWithin,
  type Collision,
  type CollisionDetection,
} from '@dnd-kit/core'
import { parseCellKey } from '../domain/placement'

const centerWithin: CollisionDetection = ({
  collisionRect,
  droppableRects,
  droppableContainers,
}) => {
  const centerX = collisionRect.left + collisionRect.width / 2
  const centerY = collisionRect.top + collisionRect.height / 2
  return droppableContainers.flatMap<Collision>((container) => {
    const rect = droppableRects.get(container.id)
    const contains =
      rect !== undefined &&
      centerX >= rect.left &&
      centerX <= rect.left + rect.width &&
      centerY >= rect.top &&
      centerY <= rect.top + rect.height
    return contains ? [{ id: container.id, data: { droppableContainer: container, value: 0 } }] : []
  })
}

export const boardCollisionDetection: CollisionDetection = (args) => {
  const pointerHits = args.pointerCoordinates ? pointerWithin(args) : []
  const hits = pointerHits.length > 0 ? pointerHits : centerWithin(args)
  if (hits.length === 0) {
    return closestCenter(args)
  }
  const tasks = hits.filter((hit) => parseCellKey(String(hit.id)) === null)
  return tasks.length > 0 ? tasks : hits
}
