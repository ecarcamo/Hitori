import type { QueryClient } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  redirect,
  type RouterHistory,
} from '@tanstack/react-router'
import { AppearancePage } from '@/features/appearance'
import { DEFAULT_AFTER_SIGN_IN, safeRedirectPath, type AuthRepository } from '@/features/auth'
import { BoardPage } from '@/features/board'
import type { CategoryRepository } from '@/features/categories'
import { InboxPage } from '@/features/inbox'
import { MatrixPage } from '@/features/matrix'
import { NowPage } from '@/features/now'
import { isOnboarded, profileQueryOptions, type ProfileRepository } from '@/features/profile'
import { WeekPage } from '@/features/week'
import { AppShell } from './layout/AppShell'
import { NotFoundPage } from './layout/NotFoundPage'
import { SettingsPage } from './layout/SettingsPage'
import { currentPathFor } from './legacyPaths'
import { HOME_PATH } from './navigation'
import { AccountView } from './routes/AccountView'
import { CategoriesView } from './routes/CategoriesView'
import { OnboardingView } from './routes/OnboardingView'
import { SignInView } from './routes/SignInView'

export interface RouterContext {
  queryClient: QueryClient
  auth: AuthRepository
  profiles: ProfileRepository
  categories: CategoryRepository
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  beforeLoad: ({ location }) => {
    const currentPath = currentPathFor(location.pathname)
    if (currentPath) {
      throw redirect({ href: `${currentPath}${location.searchStr}`, replace: true })
    }
  },
  component: Outlet,
  notFoundComponent: NotFoundPage,
})

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sign-in',
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search.redirect === 'string' ? { redirect: search.redirect } : {},
  beforeLoad: async ({ context, search }) => {
    if (await context.auth.getSession()) {
      throw redirect({ href: safeRedirectPath(search.redirect) })
    }
  },
  component: SignInView,
})

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  beforeLoad: async ({ context, location }) => {
    const session = await context.auth.getSession()
    if (!session) {
      throw redirect({ to: '/sign-in', search: { redirect: location.href } })
    }
    const profile = await context.queryClient.query({
      ...profileQueryOptions(context.profiles, session.userId),
      staleTime: 'static',
    })
    return { session, profile }
  },
})

const onboardingRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/welcome',
  beforeLoad: ({ context }) => {
    if (isOnboarded(context.profile)) {
      throw redirect({ to: DEFAULT_AFTER_SIGN_IN })
    }
  },
  component: OnboardingView,
})

const shellRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  id: 'shell',
  beforeLoad: ({ context }) => {
    if (!isOnboarded(context.profile)) {
      throw redirect({ to: '/welcome' })
    }
  },
  component: AppShell,
})

const indexRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: HOME_PATH })
  },
})

const nowRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/now',
  component: NowPage,
})

const boardRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/board',
  component: BoardPage,
})

const matrixRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/matrix',
  component: MatrixPage,
})

const weekRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/week',
  component: WeekPage,
})

const inboxRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/inbox',
  component: InboxPage,
})

const settingsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/settings',
  component: SettingsPage,
})

const accountRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/settings/account',
  component: AccountView,
})

const categoriesRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/settings/categories',
  component: CategoriesView,
})

const appearanceRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/settings/appearance',
  component: AppearancePage,
})

const routeTree = rootRoute.addChildren([
  signInRoute,
  authenticatedRoute.addChildren([
    onboardingRoute,
    shellRoute.addChildren([
      indexRoute,
      nowRoute,
      boardRoute,
      matrixRoute,
      weekRoute,
      inboxRoute,
      settingsRoute,
      accountRoute,
      categoriesRoute,
      appearanceRoute,
    ]),
  ]),
])

interface AppRouterOptions {
  context: RouterContext
  history?: RouterHistory | undefined
}

export function createAppRouter({ context, history }: AppRouterOptions) {
  return createRouter({
    routeTree,
    context,
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
