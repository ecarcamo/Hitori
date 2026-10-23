import { ComingSoonDialog } from '@/shared/ui'

interface NewTaskComingSoonProps {
  open: boolean
  onClose: () => void
}

export function NewTaskComingSoon({ open, onClose }: NewTaskComingSoonProps) {
  return (
    <ComingSoonDialog
      open={open}
      title="Crear tareas llega pronto"
      description="Estamos terminando la captura rápida: escribe una línea como «Entregar Tarea 6 vie 8pm !» y Hitori entiende el resto."
      onClose={onClose}
    />
  )
}
