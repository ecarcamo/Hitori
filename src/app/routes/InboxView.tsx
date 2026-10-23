import { getRouteApi } from '@tanstack/react-router'
import { InboxPage } from '@/features/inbox'

const inboxRoute = getRouteApi('/authenticated/shell/inbox')

export function InboxView() {
  const { tasks, profile } = inboxRoute.useRouteContext()

  return <InboxPage tasks={tasks} timezone={profile.timezone} urgencyDays={profile.urgencyDays} />
}
