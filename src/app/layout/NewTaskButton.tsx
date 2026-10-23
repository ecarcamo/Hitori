import { shortcutLabel, useCapture } from '@/features/capture'
import { Button } from '@/shared/ui'
import styles from './Sidebar.module.css'

export function NewTaskButton() {
  const open = useCapture((state) => state.open)

  return (
    <Button variant="accent" onClick={open} aria-keyshortcuts="Control+K Meta+K">
      Nueva tarea
      <kbd className={styles.shortcut} aria-hidden="true">
        {shortcutLabel()}
      </kbd>
    </Button>
  )
}
