import { useTaskPanel } from '@/features/tasks'
import { Button } from '@/shared/ui'

export function NewTaskButton() {
  const openCreate = useTaskPanel((state) => state.openCreate)

  return (
    <Button
      variant="accent"
      onClick={() => {
        openCreate()
      }}
    >
      Nueva tarea
    </Button>
  )
}
