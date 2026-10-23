import { cx } from '@/shared/lib/cx'
import styles from './BrandMark.module.css'

const GRID_CELLS = 9
const LIT_CELL = 4

interface BrandMarkProps {
  size?: 'sm' | 'lg'
}

export function BrandMark({ size = 'sm' }: BrandMarkProps) {
  return (
    <span className={cx(styles.mark, styles[size])} aria-hidden="true">
      {Array.from({ length: GRID_CELLS }, (_, index) => (
        <i key={index} className={index === LIT_CELL ? styles.lit : undefined} />
      ))}
    </span>
  )
}
