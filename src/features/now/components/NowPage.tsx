import { EmptyState, PageHeader } from '@/shared/ui'

export function NowPage() {
  return (
    <>
      <PageHeader
        title="Ahora"
        description="Las 3 tareas que te tocan según dónde estás, cuánto tiempo tienes y tu energía."
      />
      <EmptyState title="Nada por aquí todavía">
        Cuando tengas tareas, Hitori te sugiere aquí cuál empezar.
      </EmptyState>
    </>
  )
}
