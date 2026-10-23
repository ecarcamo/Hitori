import { useState, type KeyboardEvent } from 'react'
import { sortOrderAfter } from '@/shared/lib/sortOrder'
import { Icon } from '@/shared/ui'
import { CHECKLIST_LABEL_MAX_LENGTH, type Task } from '../domain/task'
import type { TaskMutations } from '../hooks/taskQueries'
import styles from './ChecklistEditor.module.css'

interface ChecklistEditorProps {
  task: Task
  mutations: TaskMutations
}

export function ChecklistEditor({ task, mutations }: ChecklistEditorProps) {
  const [label, setLabel] = useState('')
  const done = task.checklist.filter((item) => item.isDone).length

  const add = () => {
    const trimmed = label.trim()
    if (trimmed === '') {
      return
    }
    mutations.addChecklistItem.mutate({
      taskId: task.id,
      label: trimmed,
      sortOrder: sortOrderAfter(task.checklist),
    })
    setLabel('')
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      add()
    }
  }

  return (
    <section className={styles.checklist} aria-labelledby={`checklist-${task.id}`}>
      <h3 id={`checklist-${task.id}`} className={styles.title}>
        Pasos
        {task.checklist.length > 0 ? (
          <span className={styles.count}>
            {done} de {task.checklist.length}
          </span>
        ) : null}
      </h3>
      <ul className={styles.items}>
        {task.checklist.map((item) => (
          <li key={item.id} className={styles.item}>
            <button
              type="button"
              role="checkbox"
              aria-checked={item.isDone}
              className={styles.check}
              onClick={() => {
                mutations.updateChecklistItem.mutate({
                  id: item.id,
                  taskId: task.id,
                  changes: { isDone: !item.isDone },
                })
              }}
            >
              <span className={styles.box} aria-hidden="true" />
              <span className={styles.label}>{item.label}</span>
            </button>
            <button
              type="button"
              className={styles.remove}
              aria-label={`Quitar el paso ${item.label}`}
              onClick={() => {
                mutations.deleteChecklistItem.mutate({ id: item.id, taskId: task.id })
              }}
            >
              <Icon name="close" />
            </button>
          </li>
        ))}
      </ul>
      <input
        className={styles.input}
        aria-label="Nuevo paso"
        placeholder="Agregar un paso y presiona Enter"
        maxLength={CHECKLIST_LABEL_MAX_LENGTH}
        value={label}
        onChange={(event) => {
          setLabel(event.target.value)
        }}
        onKeyDown={handleKeyDown}
      />
    </section>
  )
}
