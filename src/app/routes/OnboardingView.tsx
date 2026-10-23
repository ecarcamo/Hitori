import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { OnboardingPage } from '@/features/profile'
import { HOME_PATH } from '../navigation'

const onboardingRoute = getRouteApi('/authenticated/bienvenida')

export function OnboardingView() {
  const { profiles, session } = onboardingRoute.useRouteContext()
  const navigate = useNavigate()

  return (
    <OnboardingPage
      profiles={profiles}
      userId={session.userId}
      onDone={() => {
        void navigate({ to: HOME_PATH })
      }}
    />
  )
}
