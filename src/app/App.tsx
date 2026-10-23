import { RouterProvider } from '@tanstack/react-router'
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import { useState } from 'react'
import { useDocumentAppearance } from '@/features/appearance'
import { createAppRouter, type AppRouter } from './router'

interface AppProps {
  router?: AppRouter
}

export function App({ router: providedRouter }: AppProps) {
  const [router] = useState(() => providedRouter ?? createAppRouter())
  useDocumentAppearance()

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <RouterProvider router={router} />
      </MotionConfig>
    </LazyMotion>
  )
}
