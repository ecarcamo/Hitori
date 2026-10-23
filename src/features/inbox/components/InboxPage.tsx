import { quadrantOf, TaskCard, useTaskPanel, useTasks, type TaskRepository } from '@/features/tasks'
import { useNow } from '@/shared/lib/useNow'
import { Button, EmptyState, PageHeader } from '@/shared/ui'
import styles from './InboxPage.module.css'

interface InboxPageProps {
  tasks: TaskRepository
  timezone: string
  urgencyDays: number
}

export function InboxPage({ tasks: taskRepository, timezone, urgencyDays }: InboxPageProps) {
  const { data: tasks = [], isPending } = useTasks(taskRepository)
  const openEdit = useTaskPanel((state) => state.openEdit)
  const openCreate = useTaskPanel((state) => state.openCreate)
  const now = useNow()
  const inbox = tasks.filter((task) => task.categoryId === null && task.status !== 'done')

  return (
    <>
      <PageHeader
        title="Bandeja"
        description="Lo que capturas sin categoría llega aquí. Ábrelo y dale un carril cuando puedas."
        actions={
          <Button
            variant="accent"
            onClick={() => {
              openCreate()
            }}
          >
            Nueva tarea
          </Button>
        }
      />
      {!isPending && inbox.length === 0 ? (
        <EmptyState title="Bandeja vacía">Nada pendiente de clasificar.</EmptyState>
      ) : null}
      {inbox.length > 0 ? (
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
