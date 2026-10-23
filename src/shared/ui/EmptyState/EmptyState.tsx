import type { ReactNode } from 'react'
import styles from './EmptyState.module.css'

interface EmptyStateProps {
  title: string
  children?: ReactNode
}

export function EmptyState({ title, children }: EmptyStateProps) {
  return (
    <section className={styles.empty}>
      <h2 className={styles.title}>{title}</h2>
      {children ? <div className={styles.body}>{children}</div> : null}
    </section>
  )
}
