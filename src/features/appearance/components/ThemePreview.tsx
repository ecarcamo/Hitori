import { CATEGORY_TONES, CategoryDot } from '@/shared/ui'
import type { ResolvedMode, ThemeId } from '../domain/appearance'
import styles from './ThemePreview.module.css'

const PREVIEW_TONES = CATEGORY_TONES.slice(0, 4)

interface ThemePreviewProps {
  theme: ThemeId
  mode: ResolvedMode
}

export function ThemePreview({ theme, mode }: ThemePreviewProps) {
  return (
    <span className={styles.preview} data-theme={theme} data-mode={mode} aria-hidden="true">
      <span className={styles.title}>Ahora</span>
      <span className={styles.card}>
        <i />
        <i />
      </span>
      <span className={styles.action} />
      <span className={styles.tones}>
        {PREVIEW_TONES.map((tone) => (
          <CategoryDot key={tone} tone={tone} />
        ))}
      </span>
    </span>
  )
}
