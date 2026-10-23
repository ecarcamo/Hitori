import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useCapture } from '@/features/capture'
import { categoriesQueryOptions, isActive, type CategoryRepository } from '@/features/categories'
import { quadrantOf, TaskCard, useTaskPanel, useTasks, type TaskRepository } from '@/features/tasks'
import { useNow } from '@/shared/lib/useNow'
import { Button, EmptyState, PageHeader } from '@/shared/ui'
import styles from './InboxPage.module.css'
import { InboxTriage } from './InboxTriage'

interface InboxPageProps {
  tasks: TaskRepository
  categories: CategoryRepository
  timezone: string
  urgencyDays: number
}

export function InboxPage({
  tasks: taskRepository,
  categories: categoryRepository,
  timezone,
  urgencyDays,
}: InboxPageProps) {
  const { data: tasks = [], isPending } = useTasks(taskRepository)
  const { data: allCategories = [] } = useQuery(categoriesQueryOptions(categoryRepository))
  const openEdit = useTaskPanel((state) => state.openEdit)
  const openCapture = useCapture((state) => state.open)
  const [isTriaging, setIsTriaging] = useState(false)
  const now = useNow()
  const inbox = tasks.filter((task) => task.categoryId === null && task.status !== 'done')
  const categories = allCategories.filter(isActive)
  const canTriage = inbox.length > 0 && categories.length > 0

  return (
    <>
      <PageHeader
        title="Bandeja"
        description="Lo que capturas sin categoría llega aquí. Clasifícalo de una en una cuando tengas un momento."
        actions={
          <>
            {canTriage && !isTriaging ? (
              <Button
                variant="accent"
                onClick={() => {
                  setIsTriaging(true)
                }}
              >
                Clasificar
              </Button>
            ) : null}
            <Button onClick={openCapture}>Nueva tarea</Button>
          </>
        }
      />
      {isTriaging ? (
        <InboxTriage
          inbox={inbox}
          categories={categories}
          taskRepository={taskRepository}
          timezone={timezone}
          now={now}
          onOpen={openEdit}
          onFinish={() => {
            setIsTriaging(false)
          }}
        />
      ) : null}
      {!isTriaging && !isPending && inbox.length === 0 ? (
        <EmptyState title="Bandeja vacía">Nada pendiente de clasificar.</EmptyState>
      ) : null}
      {!isTriaging && inbox.length > 0 ? (
        <ul className={styles.list} aria-label="Tareas sin categoría">
          {inbox.map((task) => (
            <li key={task.id}>
              <TaskCard
                task={task}
                quadrant={quadrantOf(task, now, urgencyDays, timezone)}
                subcategoryName={null}
                timezone={timezone}
                now={now}
                onOpen={openEdit}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </>
  )
}
