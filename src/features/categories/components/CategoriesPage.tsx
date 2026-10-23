import { useState } from 'react'
import { Button, EmptyState, PageHeader } from '@/shared/ui'
import { isActive } from '../domain/category'
import { STARTER_CATEGORIES } from '../domain/categoryRules'
import { useCategories, useCategoryMutations } from '../hooks/categoryQueries'
import { useStarterCategories } from '../hooks/useStarterCategories'
import type { CategoryRepository } from '../repositories/categoryRepository'
import { ArchivedCategories } from './ArchivedCategories'
import styles from './CategoriesPage.module.css'
import { CategoryList } from './CategoryList'
import { NewCategoryForm } from './NewCategoryForm'

interface CategoriesPageProps {
  repository: CategoryRepository
}

const STARTER_NAMES = STARTER_CATEGORIES.map((category) => category.name).join(', ')

export function CategoriesPage({ repository }: CategoriesPageProps) {
  const categoriesQuery = useCategories(repository)
  const mutations = useCategoryMutations(repository)
  const starter = useStarterCategories(repository)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const categories = categoriesQuery.data ?? []
  const active = categories.filter(isActive)
  const archived = categories.filter((category) => !isActive(category))
  const isEmpty = categoriesQuery.isSuccess && active.length === 0

  return (
    <>
      <PageHeader
        title="Categorías"
        description="Crea las tuyas, con sus subcategorías. Cada una es un carril del tablero y guarda cómo se comportan sus tareas."
        actions={
          <Button
            variant="accent"
            onClick={() => {
              setIsCreating(true)
            }}
          >
            Nueva categoría
          </Button>
        }
      />
      {isCreating ? (
        <NewCategoryForm
          categories={categories}
          mutations={mutations}
          onCreated={(category) => {
            setIsCreating(false)
            setExpandedId(category.id)
          }}
          onCancel={() => {
            setIsCreating(false)
          }}
        />
      ) : null}
      {categoriesQuery.isPending ? <p className={styles.hint}>Cargando tus categorías…</p> : null}
      {categoriesQuery.error ? (
        <p className={styles.error} role="alert">
          {categoriesQuery.error.message}
        </p>
      ) : null}
      {isEmpty && !isCreating ? (
        <EmptyState title="Todavía no tienes categorías">
          <p className={styles.emptyText}>
            Cada categoría es un carril del tablero. Crea las tuyas o empieza con un ejemplo (
            {STARTER_NAMES}) y lo ajustas después.
          </p>
          <div className={styles.formActions}>
            <Button
              variant="accent"
              onClick={() => {
                setIsCreating(true)
              }}
            >
              Crear la primera
            </Button>
            <Button
              disabled={starter.isPending}
              onClick={() => {
                starter.mutate()
              }}
            >
              {starter.isPending ? 'Creando…' : 'Usar el ejemplo'}
            </Button>
          </div>
        </EmptyState>
      ) : null}
      {active.length > 0 ? (
        <>
          <CategoryList
            categories={active}
            allCategories={categories}
            mutations={mutations}
            expandedId={expandedId}
            onToggle={(id) => {
              setExpandedId((current) => (current === id ? null : id))
            }}
          />
          <p className={styles.hint}>
            Arrastra para cambiar el orden de los carriles en el Tablero. Archivar una categoría
            guarda sus tareas pero la saca de las vistas.
          </p>
        </>
      ) : null}
      {archived.length > 0 ? (
        <ArchivedCategories categories={archived} mutations={mutations} />
      ) : null}
    </>
  )
}
