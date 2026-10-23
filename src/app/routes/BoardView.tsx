import { getRouteApi } from '@tanstack/react-router'
import { BoardPage } from '@/features/board'

const boardRoute = getRouteApi('/authenticated/shell/board')

export function BoardView() {
  const { tasks, categories, profile } = boardRoute.useRouteContext()
  const { category } = boardRoute.useSearch()

  return (
    <BoardPage
      tasks={tasks}
      categories={categories}
      timezone={profile.timezone}
      inProgressLimit={profile.maxInProgress}
      urgencyDays={profile.urgencyDays}
      focusCategoryId={category ?? null}
    />
  )
}
