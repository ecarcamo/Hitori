import { useState } from 'react'
import type { Category } from '@/features/categories'
import { formatDue, useTaskMutations, type Task, type TaskRepository } from '@/features/tasks'
import { Button, CategoryDot } from '@/shared/ui'
import styles from './InboxPage.module.css'

interface InboxTriageProps {
  inbox: readonly Task[]
  categories: readonly Category[]
  taskRepository: TaskRepository
  timezone: string
  now: Date
  onOpen: (taskId: string) => void
  onFinish: () => void
}

export function InboxTriage({
  inbox,
  categories,
  taskRepository,
  timezone,
  now,
  onOpen,
  onFinish,
}: InboxTriageProps) {
  const [skipped, setSkipped] = useState<ReadonlySet<string>>(new Set())
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const { updateTask, deleteTask } = useTaskMutations(taskRepository)
  const pending = inbox.filter((task) => !skipped.has(task.id))
  const [current] = pending

  const next = () => {
    setIsConfirmingDelete(false)
  }

  if (!current) {
    return (
      <section className={styles.triage} aria-label="Clasificar">
        <h2 className={styles.triageTitle}>
          {inbox.length === 0 ? 'Listo: la Bandeja está vacía.' : 'Ya pasaste por todas.'}
        </h2>
        <Button variant="accent" onClick={onFinish}>
          Terminar
        </Button>
      </section>
    )
  }

  return (
    <section className={styles.triage} aria-label="Clasificar">
      <p className={styles.progress}>
        {pending.length === 1 ? 'Queda 1' : `Quedan ${String(pending.length)}`}
      </p>
      <article className={styles.triageCard}>
        <h2 className={styles.triageTitle}>{current.title}</h2>
        {current.dueAt || current.isImportant ? (
          <p className={styles.triageMeta}>
            {[
              current.dueAt ? formatDue(current.dueAt, now, timezone) : null,
              current.isImportant ? 'Importante' : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        ) : null}
        {current.notes ? <p className={styles.triageNotes}>{current.notes}</p> : null}
      </article>
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>¿A qué carril va?</h3>
        <div className={styles.lanes}>
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => {
                updateTask.mutate({
                  id: current.id,
                  changes: {
                    categoryId: category.id,
                    isImportant: current.isImportant || category.importantByDefault,
                  },
                })
                next()
              }}
            >
              <CategoryDot tone={category.tone} />
              {category.name}
            </Button>
          ))}
        </div>
      </div>
      <div className={styles.triageActions}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onOpen(current.id)
          }}
        >
          Abrir
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSkipped((ids) => new Set([...ids, current.id]))
            next()
          }}
        >
          Saltar
        </Button>
        {isConfirmingDelete ? (
          <Button
            variant="accent"
            size="sm"
            onClick={() => {
              deleteTask.mutate(current.id)
              next()
            }}
          >
            Sí, borrar
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsConfirmingDelete(true)
            }}
          >
            Borrar
          </Button>
        )}
        <Button variant="ghost" size="sm" className={styles.finish} onClick={onFinish}>
          Terminar
        </Button>
      </div>
    </section>
  )
}
