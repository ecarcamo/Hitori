import { useDisclosure } from '@/shared/lib/useDisclosure'
import { Button } from '@/shared/ui'
import { NewTaskComingSoon } from './NewTaskComingSoon'

export function NewTaskButton() {
  const comingSoon = useDisclosure()

  return (
    <>
      <Button variant="accent" onClick={comingSoon.open}>
        Nueva tarea
      </Button>
      <NewTaskComingSoon open={comingSoon.isOpen} onClose={comingSoon.close} />
    </>
  )
}
