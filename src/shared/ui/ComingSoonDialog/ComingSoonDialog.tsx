import { useEffect, useId, useRef } from 'react'
import { Button } from '../Button/Button'
import styles from './ComingSoonDialog.module.css'

const GRID_CELLS = 9

interface ComingSoonDialogProps {
  open: boolean
  title: string
  description: string
  actionLabel?: string
  onClose: () => void
}

export function ComingSoonDialog({
  open,
  title,
  description,
  actionLabel = 'Entendido',
  onClose,
}: ComingSoonDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) {
      return
    }
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div className={styles.content}>
        <span className={styles.grid} aria-hidden="true">
          {Array.from({ length: GRID_CELLS }, (_, index) => (
            <i key={index} style={{ animationDelay: `${String(index * 120)}ms` }} />
          ))}
        </span>
        <span className={styles.badge}>Muy pronto</span>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <p id={descriptionId} className={styles.description}>
          {description}
        </p>
        <Button variant="accent" size="lg" autoFocus onClick={onClose}>
          {actionLabel}
        </Button>
      </div>
    </dialog>
  )
}
