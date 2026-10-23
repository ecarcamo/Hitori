import { Chip, ChipInput } from '@/shared/ui'
import { ALIAS_MAX_LENGTH, MAX_ALIASES, type Category } from '../domain/category'
import { addAlias } from '../domain/categoryRules'
import type { CategoryMutations } from '../hooks/categoryQueries'
import styles from './CategoriesPage.module.css'

interface AliasChipsProps {
  category: Category
  mutations: CategoryMutations
}

export function AliasChips({ category, mutations }: AliasChipsProps) {
  const save = (aliases: string[]) => {
    mutations.updateCategory.mutate({ id: category.id, changes: { aliases } })
  }

  const add = (value: string) => {
    if (category.aliases.length >= MAX_ALIASES) {
      return `Máximo ${String(MAX_ALIASES)} alias.`
    }
    const aliases = addAlias(category.aliases, value)
    if (!aliases) {
      return value.trim() === '' ? 'Escribe un alias.' : 'Ese alias ya está.'
    }
    save(aliases)
    return null
  }

  return (
    <div className={styles.chips}>
      {category.aliases.map((alias) => (
        <Chip
          key={alias}
          label={alias}
          removeLabel={`Quitar el alias ${alias}`}
          onRemove={() => {
            save(category.aliases.filter((item) => item !== alias))
          }}
        />
      ))}
      <ChipInput
        addLabel="Agregar alias"
        inputLabel={`Nuevo alias para ${category.name}`}
        placeholder="ingsoft"
        maxLength={ALIAS_MAX_LENGTH}
        onAdd={add}
      />
    </div>
  )
}
