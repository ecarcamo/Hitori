import { cx } from '@/shared/lib/cx'
import styles from './CategoryDot.module.css'
import { categoryToneVar, type CategoryTone } from './categoryTones'

interface CategoryDotProps {
  tone: CategoryTone
  size?: 'sm' | 'md'
}

export function CategoryDot({ tone, size = 'sm' }: CategoryDotProps) {
  return (
    <span
      className={cx(styles.dot, styles[size])}
      style={{ background: categoryToneVar(tone) }}
      aria-hidden="true"
    />
  )
}
