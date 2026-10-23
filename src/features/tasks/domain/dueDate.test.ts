import { calendarDaysFromToday, formatDue, fromDateTimeInput, toDateTimeInput } from './dueDate'

const GUATEMALA = 'America/Guatemala'
const NOW = new Date('2026-10-22T20:00:00Z')

describe('date inputs in the user timezone', () => {
  it('round-trips a local date and time through UTC', () => {
    const iso = fromDateTimeInput('2026-10-23T20:00', GUATEMALA)
    expect(iso).toBe('2026-10-24T02:00:00.000Z')
    expect(toDateTimeInput(iso, GUATEMALA)).toBe('2026-10-23T20:00')
  })

  it('ignores incomplete values', () => {
    expect(fromDateTimeInput('', GUATEMALA)).toBeNull()
    expect(fromDateTimeInput('2026-10-23', GUATEMALA)).toBeNull()
    expect(toDateTimeInput(null, GUATEMALA)).toBe('')
  })
})

describe('calendarDaysFromToday', () => {
  it('counts calendar days in the user timezone, not in UTC', () => {
    expect(calendarDaysFromToday('2026-10-23T05:00:00Z', NOW, GUATEMALA)).toBe(0)
    expect(calendarDaysFromToday('2026-10-23T07:00:00Z', NOW, GUATEMALA)).toBe(1)
  })
})

describe('formatDue', () => {
  it.each([
    ['2026-10-23T02:00:00Z', 'hoy 20:00'],
    ['2026-10-24T02:00:00Z', 'mañana 20:00'],
    ['2026-10-21T18:00:00Z', 'ayer 12:00'],
    ['2026-10-27T15:30:00Z', 'mar 27, 09:30'],
    ['2026-11-20T15:00:00Z', 'vie 20 nov'],
  ])('describes %s as %s', (dueAt, label) => {
    expect(formatDue(dueAt, NOW, GUATEMALA)).toBe(label)
  })
})
