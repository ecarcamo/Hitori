import { Link } from '@tanstack/react-router'
import { Icon } from '@/shared/ui'
import { MOBILE_LEADING_TABS, MOBILE_TRAILING_TABS } from '../navigation'
import styles from './TabBar.module.css'

export function TabBar() {
  return (
    <nav className={styles.tabs} aria-label="Vistas">
      {MOBILE_LEADING_TABS.map((tab) => (
        <Link key={tab.to} to={tab.to} className={styles.tab}>
          {tab.label}
        </Link>
      ))}
      <button
        type="button"
        className={styles.add}
        aria-label="Nueva tarea"
        title="Muy pronto"
        disabled
      >
        <Icon name="plus" />
      </button>
      {MOBILE_TRAILING_TABS.map((tab) => (
        <Link key={tab.to} to={tab.to} className={styles.tab}>
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
