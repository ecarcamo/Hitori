import { useId, type InputHTMLAttributes } from 'react'
import { cx } from '@/shared/lib/cx'
import { FieldMessages } from './FieldMessages'
import styles from './TextField.module.css'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  hint?: string
  error?: string | undefined
}

export function TextField({ label, hint, error, className, ...rest }: TextFieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        className={cx(styles.control, className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={cx(hintId, errorId) || undefined}
        {...rest}
      />
      <FieldMessages hint={hint} hintId={hintId} error={error} errorId={errorId} />
    </div>
  )
}
