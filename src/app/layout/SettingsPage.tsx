import { Link } from '@tanstack/react-router'
import { PageHeader } from '@/shared/ui'
import { SETTINGS_VIEWS } from '../navigation'
import styles from './SettingsPage.module.css'

export function SettingsPage() {
  return (
    <>
      <PageHeader title="Ajustes" />
      <nav className={styles.list} aria-label="Ajustes">
        {SETTINGS_VIEWS.map((view) => (
          <Link key={view.to} to={view.to} className={styles.item}>
            {view.label}
          </Link>
        ))}
      </nav>
    </>
  )
}
