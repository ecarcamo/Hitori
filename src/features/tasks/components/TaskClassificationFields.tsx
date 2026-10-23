import type { Category } from '@/features/categories'
import { SelectField, Switch, type SelectOption } from '@/shared/ui'
import type { TaskFields } from '../domain/task'
import styles from './TaskForm.module.css'

const NONE = ''

interface TaskClassificationFieldsProps {
  draft: TaskFields
  categories: readonly Category[]
  onChange: (changes: Partial<TaskFields>) => void
  onCategoryChange: (categoryId: string | null) => void
  onImportanceChange: (isImportant: boolean) => void
}

export function TaskClassificationFields({
  draft,
  categories,
  onChange,
  onCategoryChange,
  onImportanceChange,
}: TaskClassificationFieldsProps) {
  const category = categories.find((item) => item.id === draft.categoryId) ?? null
  const subcategories = category?.subcategories.filter((item) => item.archivedAt === null) ?? []

  const categoryOptions: SelectOption[] = [
    { value: NONE, label: 'Sin categoría (va a la Bandeja)' },
    ...categories.map((item) => ({ value: item.id, label: item.name })),
  ]
  const subcategoryOptions: SelectOption[] = [
    { value: NONE, label: subcategories.length > 0 ? 'Ninguna' : 'Esta categoría no tiene' },
    ...subcategories.map((item) => ({ value: item.id, label: item.name })),
  ]

  return (
    <>
      <div className={styles.row}>
        <SelectField
          label="Categoría"
          options={categoryOptions}
          value={draft.categoryId ?? NONE}
          onChange={(event) => {
            onCategoryChange(event.target.value === NONE ? null : event.target.value)
          }}
        />
        <SelectField
          label="Subcategoría"
          options={subcategoryOptions}
          value={draft.subcategoryId ?? NONE}
          disabled={subcategories.length === 0}
          onChange={(event) => {
            onChange({ subcategoryId: event.target.value === NONE ? null : event.target.value })
          }}
        />
      </div>
      <div className={styles.inline}>
        <Switch label="Importante" checked={draft.isImportant} onChange={onImportanceChange} />
        <span>Importante</span>
      </div>
    </>
  )
}
