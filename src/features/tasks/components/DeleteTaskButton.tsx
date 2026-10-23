import { useState } from 'react'
import { Button } from '@/shared/ui'
import styles from './TaskPanelHost.module.css'

interface DeleteTaskButtonProps {
  onDelete: () => void
}

export function DeleteTaskButton({ onDelete }: DeleteTaskButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false)

  if (!isConfirming) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={styles.delete}
        onClick={() => {
          setIsConfirming(true)
        }}
      >
        Borrar tarea
      </Button>
    )
  }

  return (
    <div className={styles.confirm} role="group" aria-label="Confirmar borrado">
      <span>¿Borrar esta tarea para siempre?</span>
      <Button size="sm" variant="accent" onClick={onDelete}>
        Sí, borrar
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          setIsConfirming(false)
        }}
      >
        Cancelar
      </Button>
    </div>
  )
}
