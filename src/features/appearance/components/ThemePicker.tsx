import { useRovingRadioGroup } from '@/shared/ui'
import { THEME_OPTIONS, type ResolvedMode } from '../domain/appearance'
import { useAppearanceStore } from '../state/appearanceStore'
import { ThemePreview } from './ThemePreview'
import styles from './ThemePicker.module.css'

const PREVIEW_MODES: readonly ResolvedMode[] = ['dark', 'light']

export function ThemePicker() {
  const theme = useAppearanceStore((state) => state.theme)
  const setTheme = useAppearanceStore((state) => state.setTheme)
  const { groupProps, getItemProps } = useRovingRadioGroup({
    count: THEME_OPTIONS.length,
    selectedIndex: THEME_OPTIONS.findIndex((option) => option.id === theme),
    onSelect: (index) => {
      const option = THEME_OPTIONS[index]
      if (option) {
        setTheme(option.id)
      }
    },
  })

  return (
    <div className={styles.themes} aria-label="Tema" {...groupProps}>
      {THEME_OPTIONS.map((option, index) => (
        <button key={option.id} type="button" className={styles.theme} {...getItemProps(index)}>
          <span className={styles.halves}>
            {PREVIEW_MODES.map((mode) => (
              <ThemePreview key={mode} theme={option.id} mode={mode} />
            ))}
          </span>
          <span className={styles.name}>
            {option.name}
            <small>{option.description}</small>
          </span>
        </button>
      ))}
    </div>
  )
}
