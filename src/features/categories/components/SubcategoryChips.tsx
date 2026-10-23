import { Chip, ChipInput } from '@/shared/ui'
import { CATEGORY_NAME_MAX_LENGTH, isActive, type Category } from '../domain/category'
import { normalizeName, validateName } from '../domain/categoryRules'
import { sortOrderAfter } from '@/shared/lib/sortOrder'
import type { CategoryMutations } from '../hooks/categoryQueries'
import styles from './CategoriesPage.module.css'

interface SubcategoryChipsProps {
  category: Category
  mutations: CategoryMutations
}

export function SubcategoryChips({ category, mutations }: SubcategoryChipsProps) {
  const active = category.subcategories.filter(isActive)

  const add = (value: string) => {
    const problem = validateName(
      value,
      active.map((subcategory) => subcategory.name),
    )
    if (problem) {
      return problem
    }
    mutations.createSubcategory.mutate({
      categoryId: category.id,
      name: normalizeName(value),
      sortOrder: sortOrderAfter(category.subcategories),
    })
    return null
  }

  return (
    <div className={styles.chips}>
      {active.map((subcategory) => (
        <Chip
          key={subcategory.id}
          label={subcategory.name}
          removeLabel={`Archivar la subcategoría ${subcategory.name}`}
          onRemove={() => {
            mutations.updateSubcategory.mutate({
              id: subcategory.id,
              categoryId: category.id,
              changes: { archivedAt: new Date().toISOString() },
            })
          }}
        />
      ))}
      <ChipInput
        addLabel="Agregar subcategoría"
        inputLabel={`Nueva subcategoría de ${category.name}`}
        maxLength={CATEGORY_NAME_MAX_LENGTH}
        onAdd={add}
      />
    </div>
  )
}
