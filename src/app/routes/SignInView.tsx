import { getRouteApi, useRouter } from '@tanstack/react-router'
import { safeRedirectPath, SignInPage } from '@/features/auth'

const signInRoute = getRouteApi('/sign-in')

export function SignInView() {
  const { auth } = signInRoute.useRouteContext()
  const search = signInRoute.useSearch()
  const router = useRouter()
  const redirectPath = safeRedirectPath(search.redirect)

  return (
    <SignInPage
      auth={auth}
      redirectPath={redirectPath}
      onSignedIn={() => {
        void router.navigate({ href: redirectPath })
      }}
    />
  )
}
