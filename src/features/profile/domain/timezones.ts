import type { SelectOption } from '@/shared/ui'

export const FALLBACK_TIMEZONE = 'UTC'

const ZERO_OFFSET = 'GMT'

export function getDeviceTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_TIMEZONE
}

export function listTimezones() {
  return Intl.supportedValuesOf('timeZone')
}

function utcOffsetLabel(timezone: string, at: Date) {
  const parts = new Intl.DateTimeFormat('es', {
    timeZone: timezone,
    timeZoneName: 'shortOffset',
  }).formatToParts(at)
  const offset = parts.find((part) => part.type === 'timeZoneName')?.value ?? ZERO_OFFSET
  return offset === ZERO_OFFSET || offset === `${ZERO_OFFSET}+0`
    ? 'UTC'
    : offset.replace(ZERO_OFFSET, 'UTC')
}

export function formatTimezoneLabel(timezone: string, at: Date) {
  const place = timezone.split('/').slice(1).join(' · ').replaceAll('_', ' ') || timezone
  return `${place} (${utcOffsetLabel(timezone, at)})`
}

export function timezoneOptions(selected: string, at: Date): SelectOption[] {
  const zones = listTimezones()
  const all = zones.includes(selected) ? zones : [selected, ...zones]
  return all.map((timezone) => ({ value: timezone, label: formatTimezoneLabel(timezone, at) }))
}
