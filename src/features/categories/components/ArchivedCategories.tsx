import { Button, CategoryDot } from '@/shared/ui'
import type { Category } from '../domain/category'
import type { CategoryMutations } from '../hooks/categoryQueries'
import styles from './CategoriesPage.module.css'

interface ArchivedCategoriesProps {
  categories: readonly Category[]
  mutations: CategoryMutations
}

export function ArchivedCategories({ categories, mutations }: ArchivedCategoriesProps) {
  return (
    <section className={styles.archived} aria-labelledby="categorias-archivadas">
      <h2 id="categorias-archivadas" className={styles.sectionTitle}>
        Archivadas
      </h2>
      <ul className={styles.archivedList}>
        {categories.map((category) => (
          <li key={category.id} className={styles.archivedItem}>
            <span className={styles.cardTitle}>
              <CategoryDot tone={category.tone} />
              {category.name}
            </span>
            <Button
              size="sm"
              onClick={() => {
                mutations.updateCategory.mutate({ id: category.id, changes: { archivedAt: null } })
              }}
            >
              Restaurar
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}
