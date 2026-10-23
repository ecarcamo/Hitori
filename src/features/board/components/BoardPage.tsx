import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { categoriesQueryOptions, isActive, type CategoryRepository } from '@/features/categories'
import {
  inProgressWarning,
  inProgressWarningMessage,
  useTaskMutations,
  useTaskPanel,
  useTasks,
  type TaskRepository,
} from '@/features/tasks'
import { useMediaQuery } from '@/shared/lib/useMediaQuery'
import { useNow } from '@/shared/lib/useNow'
import { EmptyState, PageHeader, showToast } from '@/shared/ui'
import { useEffect } from 'react'
import { buildBoard, laneAnchorId, type Board } from '../domain/boardLayout'
import { BoardGrid } from './BoardGrid'
import styles from './BoardPage.module.css'
import { BoardPager } from './BoardPager'
import type { TaskMove } from '../hooks/useBoardDrag'

const MOBILE_QUERY = '(width < 768px)'

interface BoardPageProps {
  tasks: TaskRepository
  categories: CategoryRepository
  timezone: string
  inProgressLimit: number
  urgencyDays: number
  focusCategoryId: string | null
}

function boardSummary(board: Board) {
  const active =
    board.activeCount === 1 ? '1 tarea activa' : `${String(board.activeCount)} tareas activas`
  if (board.overdueCount === 0) {
    return <>{active}. Lo que tienes en curso es lo único encendido.</>
  }
  const late = board.overdueCount === 1 ? '1 atrasada' : `${String(board.overdueCount)} atrasadas`
  return (
    <>
      {active} y <b className={styles.hot}>{late}</b>. Lo que tienes en curso es lo único encendido.
    </>
  )
}

export function BoardPage({
  tasks: taskRepository,
  categories: categoryRepository,
  timezone,
  inProgressLimit,
  urgencyDays,
  focusCategoryId,
}: BoardPageProps) {
  const tasksQuery = useTasks(taskRepository)
  const categoriesQuery = useQuery(categoriesQueryOptions(categoryRepository))
  const openEdit = useTaskPanel((state) => state.openEdit)
  const openCreate = useTaskPanel((state) => state.openCreate)
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const { updateTask } = useTaskMutations(taskRepository)
  const now = useNow()

  const categories = (categoriesQuery.data ?? []).filter(isActive)
  const board = buildBoard(tasksQuery.data ?? [], categories, now, timezone)
  const isLoading = tasksQuery.isPending || categoriesQuery.isPending
  const hasNoCategories = categoriesQuery.isSuccess && categories.length === 0

  const moveTask = (move: TaskMove) => {
    const warning = inProgressWarning(
      tasksQuery.data ?? [],
      { id: move.taskId, categoryId: move.categoryId, nextStatus: move.status },
      {
        global: inProgressLimit,
        byCategory: (categoryId) =>
          categories.find((category) => category.id === categoryId)?.maxInProgress ?? null,
      },
    )
    if (warning) {
      showToast(inProgressWarningMessage(warning))
    }
    updateTask.mutate({
      id: move.taskId,
      changes: {
        status: move.status,
        categoryId: move.categoryId,
        sortOrder: move.sortOrder,
        ...(move.categoryChanged ? { subcategoryId: null } : {}),
      },
    })
    for (const neighbor of move.rebalanced) {
      updateTask.mutate({ id: neighbor.id, changes: { sortOrder: neighbor.sortOrder } })
    }
  }

  useEffect(() => {
    if (!focusCategoryId || isLoading) {
      return
    }
    document
      .getElementById(laneAnchorId(focusCategoryId))
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [focusCategoryId, isLoading])

  return (
    <>
      <PageHeader title="Tablero" description={isLoading ? undefined : boardSummary(board)} />
      {tasksQuery.error ? (
        <p className={styles.error} role="alert">
          {tasksQuery.error.message}
        </p>
      ) : null}
      {hasNoCategories ? (
        <EmptyState title="Primero, tus carriles">
          Cada categoría es un carril del tablero.{' '}
          <Link to="/settings/categories" className={styles.link}>
            Crea tus categorías
          </Link>{' '}
          y vuelve aquí.
        </EmptyState>
      ) : null}
      {!isLoading && !hasNoCategories && isMobile ? (
        <BoardPager
          board={board}
          inProgressLimit={inProgressLimit}
          timezone={timezone}
          urgencyDays={urgencyDays}
          now={now}
          onOpen={openEdit}
          onMove={moveTask}
        />
      ) : null}
      {!isLoading && !hasNoCategories && !isMobile ? (
        <BoardGrid
          board={board}
          inProgressLimit={inProgressLimit}
          timezone={timezone}
          urgencyDays={urgencyDays}
          now={now}
          onOpen={openEdit}
          onAdd={(categoryId) => {
            openCreate({ categoryId })
          }}
          onMove={moveTask}
        />
      ) : null}
      {board.inboxCount > 0 ? (
        <p className={styles.inboxNote}>
          {board.inboxCount === 1 ? 'Hay 1 tarea' : `Hay ${String(board.inboxCount)} tareas`} sin
          categoría en la{' '}
          <Link to="/inbox" className={styles.link}>
            Bandeja
          </Link>
          .
        </p>
      ) : null}
    </>
  )
}
