import { getRouteApi } from '@tanstack/react-router'
import { AccountPage } from '@/features/profile'

const accountRoute = getRouteApi('/authenticated/shell/settings/account')

export function AccountView() {
  const { auth, profiles, session } = accountRoute.useRouteContext()

  return (
    <AccountPage
      profiles={profiles}
      userId={session.userId}
      email={session.email}
      onSignOut={auth.signOut}
    />
  )
}
