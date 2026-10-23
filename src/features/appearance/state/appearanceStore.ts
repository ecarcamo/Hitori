import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  DEFAULT_APPEARANCE,
  parseAppearance,
  type AppearancePreference,
  type ModePreference,
  type ThemeId,
} from '../domain/appearance'

export const APPEARANCE_STORAGE_KEY = 'hitori.appearance'

interface AppearanceState extends AppearancePreference {
  setTheme: (theme: ThemeId) => void
  setMode: (mode: ModePreference) => void
}

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      ...DEFAULT_APPEARANCE,
      setTheme: (theme) => {
        set({ theme })
      },
      setMode: (mode) => {
        set({ mode })
      },
    }),
    {
      name: APPEARANCE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ theme, mode }) => ({ theme, mode }),
      merge: (persisted, current) => ({ ...current, ...parseAppearance(persisted) }),
    },
  ),
)
