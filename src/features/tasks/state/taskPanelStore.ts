import { create } from 'zustand'
import type { TaskFields } from '../domain/task'

export type TaskPanel =
  | { kind: 'closed' }
  | { kind: 'create'; defaults: Partial<TaskFields> }
  | { kind: 'edit'; taskId: string }

interface TaskPanelState {
  panel: TaskPanel
  openCreate: (defaults?: Partial<TaskFields>) => void
  openEdit: (taskId: string) => void
  close: () => void
}

export const useTaskPanel = create<TaskPanelState>()((set) => ({
  panel: { kind: 'closed' },
  openCreate: (defaults = {}) => {
    set({ panel: { kind: 'create', defaults } })
  },
  openEdit: (taskId) => {
    set({ panel: { kind: 'edit', taskId } })
  },
  close: () => {
    set({ panel: { kind: 'closed' } })
  },
}))
