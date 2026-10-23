import { create } from 'zustand'

export const TOAST_DURATION_MS = 6000

interface ToastState {
  message: string | null
  sequence: number
  show: (message: string) => void
  dismiss: () => void
}

export const useToastStore = create<ToastState>()((set) => ({
  message: null,
  sequence: 0,
  show: (message) => {
    set((state) => ({ message, sequence: state.sequence + 1 }))
  },
  dismiss: () => {
    set({ message: null })
  },
}))

export function showToast(message: string) {
  useToastStore.getState().show(message)
}
