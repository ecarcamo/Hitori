import { EmptyState, PageHeader } from '@/shared/ui'

export function CategoriesPage() {
  return (
    <>
      <PageHeader
        title="Categorías"
        description="Arma tus propias categorías y subcategorías. Cada una es un carril del tablero."
      />
      <EmptyState title="Todavía no tienes categorías">
        Aquí vas a crear las tuyas, con su tono y sus valores por defecto.
      </EmptyState>
    </>
  )
}
