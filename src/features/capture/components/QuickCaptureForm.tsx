import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState, type SubmitEvent } from 'react'
import { categoriesQueryOptions, isActive, type CategoryRepository } from '@/features/categories'
import {
  emptyTaskFields,
  useTaskMutations,
  useTaskPanel,
  useTasks,
  type TaskFields,
  type TaskRepository,
} from '@/features/tasks'
import { sortOrderAfter } from '@/shared/lib/sortOrder'
import { Button, Chip, showToast } from '@/shared/ui'
import { parseCapture, type CaptureResult, type CaptureTokenKind } from '../domain/parseCapture'
import styles from './QuickCapture.module.css'

const EXAMPLE = 'Entregar Tarea 6 IngSoft vie 8pm !'

interface QuickCaptureFormProps {
  tasks: TaskRepository
  categories: CategoryRepository
  timezone: string
  onDone: () => void
}

function fieldsOf(result: CaptureResult): TaskFields {
  return emptyTaskFields({
    title: result.title,
    categoryId: result.categoryId,
    subcategoryId: result.subcategoryId,
    dueAt: result.dueAt,
    isImportant: result.isImportant,
    durationMin: result.durationMin,
    context: result.context,
  })
}

export function QuickCaptureForm({
  tasks: taskRepository,
  categories: categoryRepository,
  timezone,
  onDone,
}: QuickCaptureFormProps) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])
  const [ignored, setIgnored] = useState<ReadonlySet<CaptureTokenKind>>(new Set())
  const { data: allCategories = [] } = useQuery(categoriesQueryOptions(categoryRepository))
  const { data: tasks = [] } = useTasks(taskRepository)
  const { createTask } = useTaskMutations(taskRepository)
  const openCreate = useTaskPanel((state) => state.openCreate)
  const categories = useMemo(
    () =>
      allCategories.filter(isActive).map((category) => ({
        ...category,
        subcategories: category.subcategories.filter(isActive),
      })),
    [allCategories],
  )

  const result = useMemo(
    () => parseCapture(text, { categories, now: new Date(), timezone, ignore: ignored }),
    [text, categories, timezone, ignored],
  )
  const destination = categories.find((category) => category.id === result.categoryId)
  const canCreate = result.title !== ''

  const ignore = (kind: CaptureTokenKind) => {
    setIgnored((current) => new Set([...current, kind]))
    inputRef.current?.focus()
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canCreate) {
      return
    }
    const fields = fieldsOf(result)
    const sameCell = tasks.filter(
      (task) => task.status === 'todo' && task.categoryId === fields.categoryId,
    )
    createTask.mutate(
      { ...fields, sortOrder: sortOrderAfter(sameCell) },
      {
        onSuccess: () => {
          onDone()
          showToast(
            destination
              ? `Listo: «${fields.title}» está en ${destination.name}.`
              : `Listo: «${fields.title}» quedó en la Bandeja.`,
          )
        },
      },
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        className={styles.input}
        aria-label="Qué hay que hacer"
        placeholder={EXAMPLE}
        value={text}
        autoComplete="off"
        onChange={(event) => {
          setText(event.target.value)
          setIgnored(new Set())
        }}
      />
      <p className={styles.hint}>
        <b>!</b> importante · un alias o <b>#categoría</b> · fechas como «vie 8pm» o «mañana» ·{' '}
        <b>30min</b> · <b>@casa</b>
      </p>
      {text.trim() !== '' ? (
        <section className={styles.preview} aria-label="Lo que entendió Hitori">
          <strong className={styles.title}>{result.title || 'Falta el título'}</strong>
          <div className={styles.chips}>
            {result.understood.map((token) => (
              <Chip
                key={token.kind}
                label={token.label}
                removeLabel={`No usar «${token.label}»`}
                onRemove={() => {
                  ignore(token.kind)
                }}
              />
            ))}
            {result.categoryId === null ? <Chip label="Bandeja" /> : null}
          </div>
        </section>
      ) : null}
      <div className={styles.actions}>
        <Button type="submit" variant="accent" disabled={!canCreate || createTask.isPending}>
          {createTask.isPending ? 'Creando…' : 'Crear tarea'}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            onDone()
            openCreate(fieldsOf(result))
          }}
        >
          Más detalles
        </Button>
      </div>
      {createTask.error ? (
        <p className={styles.error} role="alert">
          {createTask.error.message}
        </p>
      ) : null}
    </form>
  )
}
