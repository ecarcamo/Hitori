import { useLayoutEffect } from 'react'
import { useResolvedAppearance } from './useResolvedAppearance'

export function useDocumentAppearance() {
  const { theme, resolvedMode } = useResolvedAppearance()

  useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.dataset.mode = resolvedMode

    const ground = getComputedStyle(root).getPropertyValue('--ground').trim()
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', ground)
  }, [theme, resolvedMode])
}
