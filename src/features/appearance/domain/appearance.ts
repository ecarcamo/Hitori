import { z } from 'zod/mini'

export const THEME_IDS = ['templo', 'ronin', 'verde', 'acero', 'mostaza'] as const
export const MODE_PREFERENCES = ['light', 'dark', 'system'] as const

export type ThemeId = (typeof THEME_IDS)[number]
export type ModePreference = (typeof MODE_PREFERENCES)[number]
export type ResolvedMode = Exclude<ModePreference, 'system'>

export interface AppearancePreference {
  theme: ThemeId
  mode: ModePreference
}

export interface ThemeOption {
  id: ThemeId
  name: string
  description: string
}

export const DEFAULT_APPEARANCE: AppearancePreference = { theme: 'templo', mode: 'dark' }

export const THEME_OPTIONS: readonly ThemeOption[] = [
  { id: 'templo', name: 'Templo', description: 'Negro y rojo' },
  { id: 'ronin', name: 'Rōnin', description: 'Pizarra y durazno' },
  { id: 'verde', name: 'Verde inglés', description: 'Verde y menta' },
  { id: 'acero', name: 'Acero', description: 'Petróleo y hielo' },
  { id: 'mostaza', name: 'Mostaza', description: 'Carbón y mostaza' },
]

const appearanceSchema = z.object({
  theme: z.enum(THEME_IDS),
  mode: z.enum(MODE_PREFERENCES),
})

export function parseAppearance(value: unknown): AppearancePreference {
  const result = appearanceSchema.safeParse(value)
  return result.success ? result.data : DEFAULT_APPEARANCE
}

export function resolveMode(mode: ModePreference, systemPrefersDark: boolean): ResolvedMode {
  if (mode !== 'system') {
    return mode
  }
  return systemPrefersDark ? 'dark' : 'light'
}
