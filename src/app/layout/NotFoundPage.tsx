import { Link } from '@tanstack/react-router'
import { EmptyState, PageHeader } from '@/shared/ui'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  return (
    <main className={styles.screen}>
      <PageHeader title="No está aquí" description="Esta página no existe." />
      <EmptyState title="Vuelve a lo que te toca">
        <Link to="/ahora" className={styles.link}>
          Ir a Ahora
        </Link>
      </EmptyState>
    </main>
  )
}
