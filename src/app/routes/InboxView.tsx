import { getRouteApi } from '@tanstack/react-router'
import { InboxPage } from '@/features/inbox'

const inboxRoute = getRouteApi('/authenticated/shell/inbox')

export function InboxView() {
  const { tasks, categories, profile } = inboxRoute.useRouteContext()

  return (
    <InboxPage
      tasks={tasks}
      categories={categories}
      timezone={profile.timezone}
      urgencyDays={profile.urgencyDays}
    />
  )
}
