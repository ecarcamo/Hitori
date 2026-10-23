import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, type RouterHistory } from '@tanstack/react-router'
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import { useEffect, useState } from 'react'
import { useDocumentAppearance } from '@/features/appearance'
import { SIGN_IN_PATH, type AuthRepository } from '@/features/auth'
import type { ProfileRepository } from '@/features/profile'
import { createQueryClient } from '@/shared/lib/queryClient'
import { createAppRouter } from './router'

export interface AppDependencies {
  auth: AuthRepository
  profiles: ProfileRepository
}

interface AppProps {
  dependencies: AppDependencies
  history?: RouterHistory
}

export function App({ dependencies, history }: AppProps) {
  const [queryClient] = useState(createQueryClient)
  const [router] = useState(() =>
    createAppRouter({ context: { queryClient, ...dependencies }, history }),
  )
  useDocumentAppearance()

  useEffect(
    () =>
      dependencies.auth.onSignedOut(() => {
        queryClient.clear()
        void router.navigate({ to: SIGN_IN_PATH })
      }),
    [dependencies.auth, queryClient, router],
  )

  return (
    <QueryClientProvider client={queryClient}>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
          <RouterProvider router={router} />
        </MotionConfig>
      </LazyMotion>
    </QueryClientProvider>
  )
}
