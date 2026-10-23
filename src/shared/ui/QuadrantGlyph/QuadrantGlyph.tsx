import { cx } from '@/shared/lib/cx'
import styles from './QuadrantGlyph.module.css'

export type QuadrantId = 'do' | 'schedule' | 'batch' | 'drop'

const QUADRANT_CELLS: readonly QuadrantId[] = ['do', 'schedule', 'batch', 'drop']

interface QuadrantGlyphProps {
  quadrant: QuadrantId
  label?: string
  size?: 'sm' | 'lg'
}

export function QuadrantGlyph({ quadrant, label, size = 'sm' }: QuadrantGlyphProps) {
  const accessibility = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true }
  return (
    <span className={cx(styles.glyph, styles[size])} {...accessibility}>
      {QUADRANT_CELLS.map((cell) => (
        <i key={cell} className={cell === quadrant ? styles[cell] : undefined} />
      ))}
    </span>
  )
}
