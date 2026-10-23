import { EmptyState, PageHeader } from '@/shared/ui'

export function InboxPage() {
  return (
    <>
      <PageHeader
        title="Bandeja"
        description="Lo que capturas sin pensar llega aquí. Luego lo clasificas de una en una."
      />
      <EmptyState title="Bandeja vacía">Nada pendiente de clasificar.</EmptyState>
    </>
  )
}
