import { useState, type ReactNode } from 'react'
import { useDisclosure } from '@/shared/lib/useDisclosure'
import {
  Button,
  ComingSoonDialog,
  SegmentedControl,
  Switch,
  TextField,
  type SegmentedOption,
} from '@/shared/ui'
import {
  CATEGORY_NAME_MAX_LENGTH,
  IN_PROGRESS_LIMIT_CHOICES,
  isActive,
  URGENCY_DAY_CHOICES,
  type Category,
} from '../domain/category'
import { normalizeName, validateName } from '../domain/categoryRules'
import type { CategoryMutations } from '../hooks/categoryQueries'
import { AliasChips } from './AliasChips'
import styles from './CategoriesPage.module.css'
import { SubcategoryChips } from './SubcategoryChips'
import { ToneRadioGroup } from './ToneRadioGroup'

const NO_VALUE = 'none'

const URGENCY_OPTIONS: readonly SegmentedOption<string>[] = [
  { value: NO_VALUE, label: 'Por defecto' },
  ...URGENCY_DAY_CHOICES.map((days) => ({
    value: String(days),
    label: days === 1 ? '1 día' : `${String(days)} días`,
  })),
]

const LIMIT_OPTIONS: readonly SegmentedOption<string>[] = [
  { value: NO_VALUE, label: 'Sin límite' },
  ...IN_PROGRESS_LIMIT_CHOICES.map((limit) => ({ value: String(limit), label: String(limit) })),
]

function toChoice(value: number | null) {
  return value === null ? NO_VALUE : String(value)
}

function fromChoice(value: string) {
  return value === NO_VALUE ? null : Number(value)
}

interface PropertyProps {
  label: string
  children: ReactNode
}

function Property({ label, children }: PropertyProps) {
  return (
    <div className={styles.property}>
      <span className={styles.propertyLabel}>{label}</span>
      {children}
    </div>
  )
}

interface CategoryEditorProps {
  category: Category
  siblings: readonly Category[]
  mutations: CategoryMutations
  canMoveUp: boolean
  canMoveDown: boolean
  onMove: (offset: -1 | 1) => void
}

export function CategoryEditor({
  category,
  siblings,
  mutations,
  canMoveUp,
  canMoveDown,
  onMove,
}: CategoryEditorProps) {
  const [name, setName] = useState(category.name)
  const [nameError, setNameError] = useState<string | null>(null)
  const calendarComingSoon = useDisclosure()
  const update = (changes: Parameters<typeof mutations.updateCategory.mutate>[0]['changes']) => {
    mutations.updateCategory.mutate({ id: category.id, changes })
  }

  const saveName = () => {
    const takenNames = siblings
      .filter((sibling) => sibling.id !== category.id && isActive(sibling))
      .map((sibling) => sibling.name)
    const problem = validateName(name, takenNames)
    setNameError(problem)
    if (!problem && normalizeName(name) !== category.name) {
      update({ name: normalizeName(name) })
    }
  }

  return (
    <div className={styles.editor}>
      <div className={styles.editorColumn}>
        <TextField
          label="Nombre"
          maxLength={CATEGORY_NAME_MAX_LENGTH}
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setNameError(null)
          }}
          onBlur={saveName}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              saveName()
            }
          }}
          error={nameError ?? mutations.updateCategory.error?.message}
        />
        <Property label="Tono">
          <ToneRadioGroup
            value={category.tone}
            onChange={(tone) => {
              update({ tone })
            }}
          />
        </Property>
      </div>
      <div className={styles.editorColumn}>
        <Property label="Subcategorías">
          <SubcategoryChips category={category} mutations={mutations} />
        </Property>
        <div className={styles.properties}>
          <Property label="Importante por defecto">
            <span className={styles.inline}>
              <Switch
                label="Importante por defecto"
                checked={category.importantByDefault}
                onChange={(importantByDefault) => {
                  update({ importantByDefault })
                }}
              />
              {category.importantByDefault ? 'Sí' : 'No'}
            </span>
          </Property>
          <Property label="Cuenta como urgente cuando vence en">
            <SegmentedControl
              label="Umbral de urgencia"
              options={URGENCY_OPTIONS}
              value={toChoice(category.urgencyDays)}
              onChange={(value) => {
                update({ urgencyDays: fromChoice(value) })
              }}
            />
          </Property>
          <Property label="Límite propio en curso">
            <SegmentedControl
              label="Límite propio en curso"
              options={LIMIT_OPTIONS}
              value={toChoice(category.maxInProgress)}
              onChange={(value) => {
                update({ maxInProgress: fromChoice(value) })
              }}
            />
          </Property>
          <Property label="Sus bloques van al calendario">
            <Button size="sm" className={styles.selfStart} onClick={calendarComingSoon.open}>
              Elegir calendario
            </Button>
          </Property>
        </div>
        <Property label="Alias para la captura rápida: si escribes uno, la tarea cae aquí">
          <AliasChips category={category} mutations={mutations} />
        </Property>
        <div className={styles.editorFooter}>
          <Button
            variant="ghost"
            size="sm"
            disabled={!canMoveUp}
            onClick={() => {
              onMove(-1)
            }}
          >
            Subir
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!canMoveDown}
            onClick={() => {
              onMove(1)
            }}
          >
            Bajar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={styles.archive}
            onClick={() => {
              update({ archivedAt: new Date().toISOString() })
            }}
          >
            Archivar categoría
          </Button>
        </div>
      </div>
      <ComingSoonDialog
        open={calendarComingSoon.isOpen}
        title="Los calendarios llegan pronto"
        description="Vas a poder conectar Google Calendar y elegir a qué calendario van los bloques de esta categoría."
        onClose={calendarComingSoon.close}
      />
    </div>
  )
}
