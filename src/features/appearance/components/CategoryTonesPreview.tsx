import { CATEGORY_TONES, categoryToneVar, type CategoryTone } from '@/shared/ui'
import styles from './CategoryTonesPreview.module.css'

const TONE_NAMES: Record<CategoryTone, string> = {
  1: 'azul',
  2: 'verde',
  3: 'naranja',
  4: 'rosa',
  5: 'amarillo',
  6: 'turquesa',
  7: 'rojo',
  8: 'lila',
}

export function CategoryTonesPreview() {
  return (
    <ul className={styles.tones}>
      {CATEGORY_TONES.map((tone) => (
        <li key={tone} className={styles.tone}>
          <i style={{ background: categoryToneVar(tone) }} aria-hidden="true" />
          {TONE_NAMES[tone]}
        </li>
      ))}
    </ul>
  )
}
