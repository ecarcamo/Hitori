import { useState, type ReactNode, type SubmitEvent } from 'react'
import type { Category } from '@/features/categories'
import {
  Button,
  SegmentedControl,
  TextAreaField,
  TextField,
  type SegmentedOption,
} from '@/shared/ui'
import {
  BLOCKED_BY_MAX_LENGTH,
  STATUS_LABELS,
  TASK_NOTES_MAX_LENGTH,
  TASK_STATUSES,
  TASK_TITLE_MAX_LENGTH,
  type TaskFields,
  type TaskStatus,
} from '../domain/task'
import { normalizeTitle, validateTitle } from '../domain/taskRules'
import { TaskClassificationFields } from './TaskClassificationFields'
import styles from './TaskForm.module.css'
import { TaskPlanningFields } from './TaskPlanningFields'

const STATUS_OPTIONS: readonly SegmentedOption<TaskStatus>[] = TASK_STATUSES.map((status) => ({
  value: status,
  label: STATUS_LABELS[status],
}))

function blankToNull(value: string | null) {
  const trimmed = value?.trim() ?? ''
  return trimmed === '' ? null : trimmed
}

interface TaskFormProps {
  initial: TaskFields
  categories: readonly Category[]
  timezone: string
  inheritImportance: boolean
  submitLabel: string
  isPending: boolean
  error: string | null
  warningFor: (fields: Pick<TaskFields, 'status' | 'categoryId'>) => string | null
  onSubmit: (fields: TaskFields) => void
  children?: ReactNode
}

export function TaskForm({
  initial,
  categories,
  timezone,
  inheritImportance,
  submitLabel,
  isPending,
  error,
  warningFor,
  onSubmit,
  children,
}: TaskFormProps) {
  const [draft, setDraft] = useState(initial)
  const [titleError, setTitleError] = useState<string | null>(null)
  const [importanceTouched, setImportanceTouched] = useState(!inheritImportance)
  const update = (changes: Partial<TaskFields>) => {
    setDraft((current) => ({ ...current, ...changes }))
  }

  const warning = warningFor(draft)

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const problem = validateTitle(draft.title)
    setTitleError(problem)
    if (problem) {
      return
    }
    onSubmit({
      ...draft,
      title: normalizeTitle(draft.title),
      notes: blankToNull(draft.notes),
      blockedBy: draft.status === 'waiting' ? blankToNull(draft.blockedBy) : null,
    })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        label="Título"
        placeholder="¿Qué hay que hacer?"
        maxLength={TASK_TITLE_MAX_LENGTH}
        value={draft.title}
        {...(inheritImportance ? { 'data-autofocus': true } : {})}
        onChange={(event) => {
          update({ title: event.target.value })
          setTitleError(null)
        }}
        error={titleError ?? undefined}
      />
      <div className={styles.group}>
        <span className={styles.groupLabel}>Estado</span>
        <SegmentedControl
          label="Estado"
          options={STATUS_OPTIONS}
          value={draft.status}
          fullWidth
          onChange={(status) => {
            update({ status })
          }}
        />
        {warning ? (
          <p className={styles.warning} role="status">
            {warning}
          </p>
        ) : null}
      </div>
      {draft.status === 'waiting' ? (
        <TextField
          label="¿Esperando a quién o a qué?"
          placeholder="Por ejemplo: acceso de DevOps"
          maxLength={BLOCKED_BY_MAX_LENGTH}
          value={draft.blockedBy ?? ''}
          onChange={(event) => {
            update({ blockedBy: event.target.value })
          }}
        />
      ) : null}
      <TaskClassificationFields
        draft={draft}
        categories={categories}
        onChange={update}
        onCategoryChange={(categoryId) => {
          const next = categories.find((item) => item.id === categoryId)
          update({
            categoryId,
            subcategoryId: null,
            ...(importanceTouched || !next ? {} : { isImportant: next.importantByDefault }),
          })
        }}
        onImportanceChange={(isImportant) => {
          setImportanceTouched(true)
          update({ isImportant })
        }}
      />
      <TaskPlanningFields draft={draft} timezone={timezone} onChange={update} />
      <TextAreaField
        label="Notas"
        maxLength={TASK_NOTES_MAX_LENGTH}
        value={draft.notes ?? ''}
        onChange={(event) => {
          update({ notes: event.target.value })
        }}
      />
      {children}
      <div className={styles.actions}>
        <Button type="submit" variant="accent" size="lg" disabled={isPending}>
          {isPending ? 'Guardando…' : submitLabel}
        </Button>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  )
}
