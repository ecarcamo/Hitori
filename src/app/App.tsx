import styles from './App.module.css'

const BRAND_MARK_CELLS = 9
const LIT_CELL_INDEX = 4

export function App() {
  return (
    <main className={styles.screen}>
      <span className={styles.mark} aria-hidden="true">
        {Array.from({ length: BRAND_MARK_CELLS }, (_, index) => (
          <i key={index} className={index === LIT_CELL_INDEX ? styles.lit : undefined} />
        ))}
      </span>
      <h1 className={styles.title}>Hitori</h1>
      <p className={styles.tagline}>Tu tablero, a tu ritmo.</p>
    </main>
  )
}
