import { SegmentedControl, type SegmentedOption } from '@/shared/ui'
import type { ResolvedMode } from '../domain/appearance'
import { useResolvedAppearance } from '../hooks/useResolvedAppearance'
import { useAppearanceStore } from '../state/appearanceStore'

const MODE_OPTIONS: readonly SegmentedOption<ResolvedMode>[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
]

export function ModeToggle() {
  const { resolvedMode } = useResolvedAppearance()
  const setMode = useAppearanceStore((state) => state.setMode)

  return (
    <SegmentedControl label="Modo" options={MODE_OPTIONS} value={resolvedMode} onChange={setMode} />
  )
}
