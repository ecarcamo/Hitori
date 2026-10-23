import { Link } from '@tanstack/react-router'
import { ModeToggle } from '@/features/appearance'
import { BrandMark } from '@/shared/ui'
import { PRIMARY_VIEWS, SETTINGS_VIEWS } from '../navigation'
import { NewTaskButton } from './NewTaskButton'
import styles from './Sidebar.module.css'

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <Link to="/ahora" className={styles.brand}>
        <BrandMark />
        Hitori
      </Link>
      <NewTaskButton />
      <nav className={styles.nav} aria-label="Vistas">
        {PRIMARY_VIEWS.map((view) => (
          <Link key={view.to} to={view.to} className={styles.link}>
            {view.label}
          </Link>
        ))}
      </nav>
      <div className={styles.footer}>
        <nav className={styles.nav} aria-label="Ajustes">
          {SETTINGS_VIEWS.map((view) => (
            <Link key={view.to} to={view.to} className={styles.link}>
              {view.label}
            </Link>
          ))}
        </nav>
        <ModeToggle />
      </div>
    </aside>
  )
}
