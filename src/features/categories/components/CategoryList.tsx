import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { Category } from '../domain/category'
import { sortOrderForMove } from '@/shared/lib/sortOrder'
import type { CategoryMutations } from '../hooks/categoryQueries'
import styles from './CategoriesPage.module.css'
import { CategoryCard } from './CategoryCard'

const DRAG_ACTIVATION_DISTANCE = 6

interface CategoryListProps {
  categories: readonly Category[]
  allCategories: readonly Category[]
  mutations: CategoryMutations
  expandedId: string | null
  onToggle: (id: string) => void
}

function nameOf(categories: readonly Category[], id: string | number | undefined) {
  return categories.find((category) => category.id === id)?.name ?? 'la categoría'
}

function positionOf(categories: readonly Category[], id: string | number | undefined) {
  return categories.findIndex((category) => category.id === id) + 1
}

export function CategoryList({
  categories,
  allCategories,
  mutations,
  expandedId,
  onToggle,
}: CategoryListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const move = (fromIndex: number, toIndex: number) => {
    const category = categories[fromIndex]
    const sortOrder = sortOrderForMove(categories, fromIndex, toIndex)
    if (category && sortOrder) {
      mutations.updateCategory.mutate({ id: category.id, changes: { sortOrder } })
    }
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return
    }
    move(
      categories.findIndex((category) => category.id === active.id),
      categories.findIndex((category) => category.id === over.id),
    )
  }

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Tomaste ${nameOf(categories, active.id)}.`,
    onDragOver: ({ active, over }) =>
      over
        ? `${nameOf(categories, active.id)} está en la posición ${String(positionOf(categories, over.id))} de ${String(categories.length)}.`
        : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `Soltaste ${nameOf(categories, active.id)} en la posición ${String(positionOf(categories, over.id))}.`
        : `Soltaste ${nameOf(categories, active.id)}.`,
    onDragCancel: ({ active }) => `Cancelaste el movimiento de ${nameOf(categories, active.id)}.`,
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable:
            'Para mover una categoría, presiona espacio o Enter, usa las flechas y vuelve a presionar espacio o Enter para soltarla. Escape cancela.',
        },
      }}
    >
      <SortableContext
        items={categories.map((category) => category.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={styles.list}>
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              siblings={allCategories}
              mutations={mutations}
              isExpanded={expandedId === category.id}
              canMoveUp={index > 0}
              canMoveDown={index < categories.length - 1}
              onToggle={() => {
                onToggle(category.id)
              }}
              onMove={(offset) => {
                move(index, index + offset)
              }}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
