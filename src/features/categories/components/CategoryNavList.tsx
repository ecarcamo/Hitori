import { Link } from '@tanstack/react-router'
import { CategoryDot } from '@/shared/ui'
import { isActive } from '../domain/category'
import { useCategories } from '../hooks/categoryQueries'
import type { CategoryRepository } from '../repositories/categoryRepository'
import styles from './CategoryNavList.module.css'

interface CategoryNavListProps {
  repository: CategoryRepository
  linkClassName?: string | undefined
}

export function CategoryNavList({ repository, linkClassName }: CategoryNavListProps) {
  const { data: categories = [] } = useCategories(repository)
  const active = categories.filter(isActive)

  if (active.length === 0) {
    return null
  }

  return (
    <>
      <span className={styles.label}>Categorías</span>
      {active.map((category) => (
        <Link key={category.id} to="/tablero" className={linkClassName}>
          <CategoryDot tone={category.tone} />
          {category.name}
        </Link>
      ))}
    </>
  )
}
