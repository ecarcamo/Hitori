import { TZDate, tzOffset } from '@date-fns/tz'
import * as chronoEs from 'chrono-node/es'

const END_OF_DAY_HOUR = 23
const END_OF_DAY_MINUTE = 59
const HOURS_IN_HALF_DAY = 12

const PERIOD_OF_DAY = /\b(\d{1,2})(?::(\d{2}))?\s+de\s+la\s+(manana|mañana|tarde|noche)\b/giu

function toTwentyFourHours(hour: number, period: string) {
  const isAfternoon = period === 'tarde' || period === 'noche'
  return isAfternoon && hour < HOURS_IN_HALF_DAY ? hour + HOURS_IN_HALF_DAY : hour
}

export function normalizePeriods(text: string) {
  return text.replace(
    PERIOD_OF_DAY,
    (_match, hour: string, minutes: string | undefined, period: string) => {
      const converted = toTwentyFourHours(Number(hour), period.toLocaleLowerCase('es'))
      return `${String(converted)}:${minutes ?? '00'}`
    },
  )
}

export interface FoundDate {
  dueAt: string
  text: string
  index: number
}

export function findDueDate(text: string, now: Date, timezone: string): FoundDate | null {
  const [result] = chronoEs.parse(
    text,
    { instant: now, timezone: tzOffset(timezone, now) },
    { forwardDate: true },
  )
  if (!result) {
    return null
  }
  const parsed = result.start.date()
  if (result.start.isCertain('hour')) {
    return { dueAt: parsed.toISOString(), text: result.text, index: result.index }
  }
  const local = new TZDate(parsed, timezone)
  const endOfDay = new TZDate(
    local.getFullYear(),
    local.getMonth(),
    local.getDate(),
    END_OF_DAY_HOUR,
    END_OF_DAY_MINUTE,
    timezone,
  )
  return {
    dueAt: new Date(endOfDay.getTime()).toISOString(),
    text: result.text,
    index: result.index,
  }
}
