import { useState, type SubmitEvent } from 'react'
import { Button, TextField } from '@/shared/ui'
import { CATEGORY_NAME_MAX_LENGTH, isActive, type Category } from '../domain/category'
import { nextAvailableTone, normalizeName, validateName } from '../domain/categoryRules'
import { sortOrderAfter } from '../domain/sortOrder'
import type { CategoryMutations } from '../hooks/categoryQueries'
import styles from './CategoriesPage.module.css'

interface NewCategoryFormProps {
  categories: readonly Category[]
  mutations: CategoryMutations
  onCreated: (category: Category) => void
  onCancel: () => void
}

export function NewCategoryForm({
  categories,
  mutations,
  onCreated,
  onCancel,
}: NewCategoryFormProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { createCategory } = mutations

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const activeNames = categories.filter(isActive).map((category) => category.name)
    const problem = validateName(name, activeNames)
    setError(problem)
    if (problem) {
      return
    }
    createCategory.mutate(
      {
        name: normalizeName(name),
        tone: nextAvailableTone(categories),
        sortOrder: sortOrderAfter(categories),
      },
      { onSuccess: onCreated },
    )
  }

  return (
    <form className={styles.newCategory} onSubmit={handleSubmit} noValidate>
      <TextField
        label="Nombre de la categoría"
        placeholder="Por ejemplo: Universidad"
        maxLength={CATEGORY_NAME_MAX_LENGTH}
        value={name}
        autoFocus
        onChange={(event) => {
          setName(event.target.value)
          setError(null)
        }}
        error={error ?? createCategory.error?.message}
      />
      <div className={styles.formActions}>
        <Button type="submit" variant="accent" disabled={createCategory.isPending}>
          {createCategory.isPending ? 'Creando…' : 'Crear categoría'}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
