import styles from './Divider.module.css'

interface DividerProps {
  label: string
}

export function Divider({ label }: DividerProps) {
  return (
    <div className={styles.divider} role="separator" aria-label={label}>
      <span aria-hidden="true">{label}</span>
    </div>
  )
}
