import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useId } from 'react'
import { cx } from '@/shared/lib/cx'
import { CategoryDot, Chip, Icon } from '@/shared/ui'
import { isActive, type Category } from '../domain/category'
import { summarizeCategory, TONE_NAMES } from '../domain/categoryRules'
import type { CategoryMutations } from '../hooks/categoryQueries'
import styles from './CategoriesPage.module.css'
import { CategoryEditor } from './CategoryEditor'

interface CategoryCardProps {
  category: Category
  siblings: readonly Category[]
  mutations: CategoryMutations
  isExpanded: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  onToggle: () => void
  onMove: (offset: -1 | 1) => void
}

function subcategorySummary(category: Category) {
  const count = category.subcategories.filter(isActive).length
  const subcategories = count === 1 ? '1 subcategoría' : `${String(count)} subcategorías`
  return `${subcategories} · tono ${TONE_NAMES[category.tone]}`
}

export function CategoryCard({
  category,
  siblings,
  mutations,
  isExpanded,
  canMoveUp,
  canMoveDown,
  onToggle,
  onMove,
}: CategoryCardProps) {
  const editorId = useId()
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  return (
    <section
      ref={setNodeRef}
      className={cx(styles.card, isExpanded && styles.cardOpen, isDragging && styles.cardDragging)}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      aria-label={category.name}
    >
      <div className={styles.cardHead}>
        <button
          ref={setActivatorNodeRef}
          type="button"
          className={styles.handle}
          aria-label={`Mover ${category.name}`}
          {...attributes}
          {...listeners}
        >
          <Icon name="grip" />
        </button>
        <button
          type="button"
          className={styles.cardToggle}
          aria-expanded={isExpanded}
          aria-controls={editorId}
          onClick={onToggle}
        >
          <span className={styles.cardTitle}>
            <CategoryDot tone={category.tone} size="md" />
            {category.name}
          </span>
          <span className={styles.cardMeta}>{subcategorySummary(category)}</span>
        </button>
        <span className={cx(styles.chevron, isExpanded && styles.chevronOpen)} aria-hidden="true">
          <Icon name="chevronDown" />
        </span>
      </div>
      {isExpanded ? (
        <div id={editorId}>
          <CategoryEditor
            category={category}
            siblings={siblings}
            mutations={mutations}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onMove={onMove}
          />
        </div>
      ) : (
        <div className={styles.cardBody}>
          {category.subcategories.some(isActive) ? (
            <div className={styles.chips}>
              {category.subcategories.filter(isActive).map((subcategory) => (
                <Chip key={subcategory.id} label={subcategory.name} />
              ))}
            </div>
          ) : null}
          <p className={styles.summary}>{summarizeCategory(category)}</p>
        </div>
      )}
    </section>
  )
}
