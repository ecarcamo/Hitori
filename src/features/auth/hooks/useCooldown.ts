import { useCallback, useEffect, useState } from 'react'

const TICK_MS = 1000

export function useCooldown(seconds: number) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    if (remaining <= 0) {
      return
    }
    const timeout = setTimeout(() => {
      setRemaining((value) => value - 1)
    }, TICK_MS)
    return () => {
      clearTimeout(timeout)
    }
  }, [remaining])

  const restart = useCallback(() => {
    setRemaining(seconds)
  }, [seconds])

  return { remaining, restart }
}
