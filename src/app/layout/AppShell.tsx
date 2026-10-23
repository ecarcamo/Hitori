import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import * as m from 'motion/react-m'
import { Icon } from '@/shared/ui'
import styles from './AppShell.module.css'
import { Sidebar } from './Sidebar'
import { TabBar } from './TabBar'

const PAGE_ENTRANCE = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { type: 'spring', stiffness: 380, damping: 32 },
} as const

export function AppShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <div className={styles.shell}>
      <a href="#contenido" className={styles.skipLink}>
        Saltar al contenido
      </a>
      <Sidebar />
      <main id="contenido" className={styles.main}>
        <Link to="/settings" className={styles.mobileSettings} aria-label="Ajustes">
          <Icon name="settings" />
        </Link>
        <m.div key={pathname} className={styles.page} {...PAGE_ENTRANCE}>
          <Outlet />
        </m.div>
      </main>
      <TabBar />
    </div>
  )
}
