import {
  CATEGORY_TONES,
  categoryToneVar,
  useRovingRadioGroup,
  type CategoryTone,
} from '@/shared/ui'
import { TONE_NAMES } from '../domain/categoryRules'
import styles from './CategoriesPage.module.css'

interface ToneRadioGroupProps {
  value: CategoryTone
  onChange: (tone: CategoryTone) => void
}

export function ToneRadioGroup({ value, onChange }: ToneRadioGroupProps) {
  const { groupProps, getItemProps } = useRovingRadioGroup({
    count: CATEGORY_TONES.length,
    selectedIndex: CATEGORY_TONES.indexOf(value),
    onSelect: (index) => {
      const tone = CATEGORY_TONES[index]
      if (tone) {
        onChange(tone)
      }
    },
  })

  return (
    <div className={styles.tones} aria-label="Tono de la categoría" {...groupProps}>
      {CATEGORY_TONES.map((tone, index) => (
        <button
          key={tone}
          type="button"
          className={styles.tone}
          style={{ background: categoryToneVar(tone) }}
          aria-label={TONE_NAMES[tone]}
          {...getItemProps(index)}
        />
      ))}
    </div>
  )
}
