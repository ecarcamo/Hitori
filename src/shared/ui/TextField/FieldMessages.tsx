import styles from './TextField.module.css'

interface FieldMessagesProps {
  hint?: string | undefined
  hintId?: string | undefined
  error?: string | undefined
  errorId?: string | undefined
}

export function FieldMessages({ hint, hintId, error, errorId }: FieldMessagesProps) {
  return (
    <>
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </>
  )
}
