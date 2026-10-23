import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  type RouterHistory,
} from '@tanstack/react-router'
import { AppearancePage } from '@/features/appearance'
import { BoardPage } from '@/features/board'
import { CategoriesPage } from '@/features/categories'
import { InboxPage } from '@/features/inbox'
import { MatrixPage } from '@/features/matrix'
import { NowPage } from '@/features/now'
import { WeekPage } from '@/features/week'
import { AppShell } from './layout/AppShell'
import { NotFoundPage } from './layout/NotFoundPage'
import { HOME_PATH } from './navigation'

const rootRoute = createRootRoute({ component: AppShell, notFoundComponent: NotFoundPage })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: HOME_PATH })
  },
})

const nowRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ahora',
  component: NowPage,
})

const boardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tablero',
  component: BoardPage,
})

const matrixRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/matriz',
  component: MatrixPage,
})

const weekRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/semana',
  component: WeekPage,
})

const inboxRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bandeja',
  component: InboxPage,
})

const categoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ajustes/categorias',
  component: CategoriesPage,
})

const appearanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ajustes/apariencia',
  component: AppearancePage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  nowRoute,
  boardRoute,
  matrixRoute,
  weekRoute,
  inboxRoute,
  categoriesRoute,
  appearanceRoute,
])

export function createAppRouter(history?: RouterHistory) {
  return createRouter({
    routeTree,
    defaultPreload: 'intent',
    ...(history ? { history } : {}),
  })
}

export type AppRouter = ReturnType<typeof createAppRouter>

declare module '@tanstack/react-router' {
  interface Register {
    router: AppRouter
  }
}
