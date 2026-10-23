import { useEffect } from 'react'
import { useCapture } from '../state/captureStore'

const SHORTCUT_KEY = 'k'

export function useCaptureShortcut() {
  const open = useCapture((state) => state.open)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const usesModifier = event.metaKey || event.ctrlKey
      if (usesModifier && !event.altKey && event.key.toLowerCase() === SHORTCUT_KEY) {
        event.preventDefault()
        open()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])
}

export function shortcutLabel() {
  return /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘ K' : 'Ctrl K'
}
