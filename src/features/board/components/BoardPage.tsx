import { PageHeader, WipMeter } from '@/shared/ui'
import { cx } from '@/shared/lib/cx'
import styles from './BoardPage.module.css'

const DEFAULT_WIP_LIMIT = 3

const COLUMNS = [
  { id: 'todo', title: 'Por hacer', isLit: false },
  { id: 'in_progress', title: 'En curso', isLit: true },
  { id: 'waiting', title: 'Esperando', isLit: false },
  { id: 'done', title: 'Hecho', isLit: false },
] as const

export function BoardPage() {
  return (
    <>
      <PageHeader
        title="Tablero"
        description="Tus tareas por categoría y estado. Lo que tienes en curso es lo único encendido."
      />
      <section className={styles.board} aria-label="Tablero por categoría">
        <div className={styles.columns}>
          {COLUMNS.map((column) => (
            <div key={column.id} className={cx(styles.column, column.isLit && styles.lit)}>
              <h2 className={styles.columnTitle}>
                {column.title}
                {column.isLit ? <WipMeter used={0} limit={DEFAULT_WIP_LIMIT} /> : <span>0</span>}
              </h2>
              <p className={styles.empty}>
                {column.isLit ? 'Tienes 3 espacios libres' : 'Sin tareas'}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
