import { EmptyState, PageHeader } from '@/shared/ui'

export function WeekPage() {
  return (
    <>
      <PageHeader
        title="Semana"
        description="Tus tareas sin agendar a un lado y tu calendario al otro."
      />
      <EmptyState title="Tu semana está libre">
        Cuando conectes tu calendario, aquí podrás arrastrar tareas para reservarles tiempo.
      </EmptyState>
    </>
  )
}
