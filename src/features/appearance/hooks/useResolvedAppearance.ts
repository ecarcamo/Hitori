import { resolveMode } from '../domain/appearance'
import { useAppearanceStore } from '../state/appearanceStore'
import { useSystemPrefersDark } from './useSystemPrefersDark'

export function useResolvedAppearance() {
  const theme = useAppearanceStore((state) => state.theme)
  const mode = useAppearanceStore((state) => state.mode)
  const systemPrefersDark = useSystemPrefersDark()

  return { theme, mode, resolvedMode: resolveMode(mode, systemPrefersDark) }
}
