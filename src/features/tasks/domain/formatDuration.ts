const MINUTES_PER_HOUR = 60

export function formatDuration(minutes: number) {
  if (minutes < MINUTES_PER_HOUR) {
    return `${String(minutes)} min`
  }
  const hours = Math.floor(minutes / MINUTES_PER_HOUR)
  const rest = minutes % MINUTES_PER_HOUR
  return rest === 0 ? `${String(hours)} h` : `${String(hours)} h ${String(rest)} min`
}
