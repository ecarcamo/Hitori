import { Icon } from '../Icon/Icon'
import styles from './Chip.module.css'

interface ChipProps {
  label: string
  onRemove?: () => void
  removeLabel?: string
}

export function Chip({ label, onRemove, removeLabel }: ChipProps) {
  return (
    <span className={styles.chip}>
      {label}
      {onRemove ? (
        <button
          type="button"
          className={styles.remove}
          aria-label={removeLabel ?? `Quitar ${label}`}
          onClick={onRemove}
        >
          <Icon name="close" />
        </button>
      ) : null}
    </span>
  )
}
