import { PageHeader, QuadrantGlyph, type QuadrantId } from '@/shared/ui'
import { cx } from '@/shared/lib/cx'
import styles from './MatrixPage.module.css'

interface Quadrant {
  id: QuadrantId
  name: string
  rule: string
}

const QUADRANTS: readonly Quadrant[] = [
  { id: 'do', name: 'Hacer ya', rule: 'Importante y urgente' },
  { id: 'schedule', name: 'Agendar', rule: 'Importante, sin prisa' },
  { id: 'batch', name: 'Resolver en lote', rule: 'Urgente, poco importante' },
  { id: 'drop', name: 'Soltar', rule: 'Ni importante ni urgente' },
]

export function MatrixPage() {
  return (
    <>
      <PageHeader
        title="Matriz"
        description="Tú decides qué es importante. Lo urgente lo calcula Hitori con la fecha límite."
      />
      <div className={styles.matrix}>
        {QUADRANTS.map((quadrant) => (
          <section
            key={quadrant.id}
            className={cx(styles.quadrant, quadrant.id === 'do' && styles.lit)}
            aria-label={quadrant.name}
          >
            <div className={styles.head}>
              <QuadrantGlyph quadrant={quadrant.id} size="lg" />
              <h2 className={styles.name}>{quadrant.name}</h2>
              <span className={styles.count}>0</span>
            </div>
            <p className={styles.rule}>{quadrant.rule}</p>
          </section>
        ))}
      </div>
    </>
  )
}
