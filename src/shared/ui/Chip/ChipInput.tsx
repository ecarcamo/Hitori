import { useId, useState, type KeyboardEvent } from 'react'
import { Icon } from '../Icon/Icon'
import styles from './Chip.module.css'

interface ChipInputProps {
  addLabel: string
  inputLabel: string
  placeholder?: string
  maxLength?: number
  onAdd: (value: string) => string | null
}

export function ChipInput({ addLabel, inputLabel, placeholder, maxLength, onAdd }: ChipInputProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const errorId = useId()

  const close = () => {
    setIsEditing(false)
    setValue('')
    setError(null)
  }

  const submit = () => {
    const problem = onAdd(value)
    setError(problem)
    if (!problem) {
      setValue('')
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      submit()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      close()
    }
  }

  if (!isEditing) {
    return (
      <button
        type="button"
        className={styles.add}
        onClick={() => {
          setIsEditing(true)
        }}
      >
        <Icon name="plus" />
        {addLabel}
      </button>
    )
  }

  return (
    <span className={styles.editor}>
      <input
        className={styles.input}
        aria-label={inputLabel}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        placeholder={placeholder}
        maxLength={maxLength}
        value={value}
        autoFocus
        onChange={(event) => {
          setValue(event.target.value)
          setError(null)
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (value.trim() === '') {
            close()
          }
        }}
      />
      {error ? (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </span>
  )
}
