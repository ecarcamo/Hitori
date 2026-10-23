import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { LazyMotion, domAnimation } from 'motion/react'
import type { ReactElement } from 'react'

export function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <LazyMotion features={domAnimation}>{ui}</LazyMotion>
    </QueryClientProvider>,
  )
}
