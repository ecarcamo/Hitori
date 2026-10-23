import { useEffect, useState } from 'react'

const ONE_MINUTE_MS = 60_000

export function useNow(intervalMs = ONE_MINUTE_MS) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, intervalMs)
    return () => {
      clearInterval(interval)
    }
  }, [intervalMs])

  return now
}
