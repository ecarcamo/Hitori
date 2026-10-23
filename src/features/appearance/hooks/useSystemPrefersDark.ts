import { useSyncExternalStore } from 'react'

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)'

function subscribe(onChange: () => void) {
  const media = window.matchMedia(DARK_SCHEME_QUERY)
  media.addEventListener('change', onChange)
  return () => {
    media.removeEventListener('change', onChange)
  }
}

function getSnapshot() {
  return window.matchMedia(DARK_SCHEME_QUERY).matches
}

export function useSystemPrefersDark() {
  return useSyncExternalStore(subscribe, getSnapshot, () => true)
}
