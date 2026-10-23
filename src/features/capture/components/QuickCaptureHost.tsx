import { lazy, Suspense } from 'react'
import type { CategoryRepository } from '@/features/categories'
import type { TaskRepository } from '@/features/tasks'
import { Modal } from '@/shared/ui'
import { useCaptureShortcut } from '../hooks/useCaptureShortcut'
import { useCapture } from '../state/captureStore'

const QuickCaptureForm = lazy(() =>
  import('./QuickCaptureForm').then((module) => ({ default: module.QuickCaptureForm })),
)

interface QuickCaptureHostProps {
  tasks: TaskRepository
  categories: CategoryRepository
  timezone: string
}

export function QuickCaptureHost({ tasks, categories, timezone }: QuickCaptureHostProps) {
  const isOpen = useCapture((state) => state.isOpen)
  const close = useCapture((state) => state.close)
  useCaptureShortcut()

  return (
    <Modal open={isOpen} title="Nueva tarea" onClose={close}>
      <Suspense fallback={null}>
        <QuickCaptureForm
          tasks={tasks}
          categories={categories}
          timezone={timezone}
          onDone={close}
        />
      </Suspense>
    </Modal>
  )
}
