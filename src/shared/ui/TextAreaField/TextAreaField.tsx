import { useId, type TextareaHTMLAttributes } from 'react'
import { cx } from '@/shared/lib/cx'
import { FieldMessages } from '../TextField/FieldMessages'
import fieldStyles from '../TextField/TextField.module.css'
import styles from './TextAreaField.module.css'

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: string
  hint?: string
}

export function TextAreaField({ label, hint, className, ...rest }: TextAreaFieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined

  return (
    <div className={fieldStyles.field}>
      <label htmlFor={id} className={fieldStyles.label}>
        {label}
      </label>
      <textarea
        id={id}
        className={cx(fieldStyles.control, styles.textarea, className)}
        aria-describedby={hintId}
        {...rest}
      />
      <FieldMessages hint={hint} hintId={hintId} />
    </div>
  )
}
