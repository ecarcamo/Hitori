import { useId, type SelectHTMLAttributes } from 'react'
import { cx } from '@/shared/lib/cx'
import { FieldMessages } from '../TextField/FieldMessages'
import fieldStyles from '../TextField/TextField.module.css'
import styles from './SelectField.module.css'

export interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string
  options: readonly SelectOption[]
  hint?: string
}

export function SelectField({ label, options, hint, className, ...rest }: SelectFieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined

  return (
    <div className={fieldStyles.field}>
      <label htmlFor={id} className={fieldStyles.label}>
        {label}
      </label>
      <span className={styles.wrapper}>
        <select
          id={id}
          className={cx(fieldStyles.control, styles.select, className)}
          aria-describedby={hintId}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </span>
      <FieldMessages hint={hint} hintId={hintId} />
    </div>
  )
}
