import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from './Toast.module.css'
import { TOAST_DURATION_MS, useToastStore } from './toastStore'

export function ToastHost() {
  const message = useToastStore((state) => state.message)
  const sequence = useToastStore((state) => state.sequence)
  const dismiss = useToastStore((state) => state.dismiss)

  useEffect(() => {
    if (!message) {
      return
    }
    const timeout = setTimeout(dismiss, TOAST_DURATION_MS)
    return () => {
      clearTimeout(timeout)
    }
  }, [message, sequence, dismiss])

  return createPortal(
    <p key={sequence} className={styles.toast} role="status" hidden={!message}>
      {message}
    </p>,
    document.body,
  )
}
