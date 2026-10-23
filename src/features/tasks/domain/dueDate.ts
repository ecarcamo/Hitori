import { TZDate } from '@date-fns/tz'
import { differenceInCalendarDays, format } from 'date-fns'

const INPUT_FORMAT = "yyyy-MM-dd'T'HH:mm"
const INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
const NEARBY_DAYS = 6

export function calendarDaysFromToday(dueAt: string, now: Date, timezone: string) {
  return differenceInCalendarDays(new TZDate(dueAt, timezone), new TZDate(now, timezone))
}

export function toDateTimeInput(dueAt: string | null, timezone: string) {
  return dueAt ? format(new TZDate(dueAt, timezone), INPUT_FORMAT) : ''
}

export function fromDateTimeInput(value: string, timezone: string) {
  const match = INPUT_PATTERN.exec(value)
  if (!match) {
    return null
  }
  const [, year, month, day, hours, minutes] = match.map(Number)
  if (
    year === undefined ||
    month === undefined ||
    day === undefined ||
    hours === undefined ||
    minutes === undefined
  ) {
    return null
  }
  const zoned = new TZDate(year, month - 1, day, hours, minutes, timezone)
  return new Date(zoned.getTime()).toISOString()
}

function timeLabel(dueAt: string, timezone: string) {
  return new Intl.DateTimeFormat('es', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(dueAt))
}

export function formatDue(dueAt: string, now: Date, timezone: string) {
  const days = calendarDaysFromToday(dueAt, now, timezone)
  const time = timeLabel(dueAt, timezone)
  if (days === 0) {
    return `hoy ${time}`
  }
  if (days === 1) {
    return `mañana ${time}`
  }
  if (days === -1) {
    return `ayer ${time}`
  }
  const isNearby = Math.abs(days) <= NEARBY_DAYS
  const date = new Intl.DateTimeFormat('es', {
    timeZone: timezone,
    weekday: 'short',
    day: 'numeric',
    ...(isNearby ? {} : { month: 'short' }),
  })
    .format(new Date(dueAt))
    .replaceAll('.', '')
    .replaceAll(',', '')
  return isNearby ? `${date}, ${time}` : date
}
