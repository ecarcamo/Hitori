import { Link } from '@tanstack/react-router'
import { EmptyState, PageHeader } from '@/shared/ui'

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="No está aquí" description="Esta página no existe." />
      <EmptyState title="Vuelve a lo que te toca">
        <Link to="/ahora">Ir a Ahora</Link>
      </EmptyState>
    </>
  )
}
