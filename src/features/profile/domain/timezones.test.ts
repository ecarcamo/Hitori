import { formatTimezoneLabel, timezoneOptions } from './timezones'

const OCTOBER_2026 = new Date('2026-10-22T18:00:00Z')

describe('formatTimezoneLabel', () => {
  it('shows the place and the offset from UTC', () => {
    expect(formatTimezoneLabel('America/Guatemala', OCTOBER_2026)).toBe('Guatemala (UTC-6)')
  })

  it('shows nested places and spaces', () => {
    expect(formatTimezoneLabel('America/Argentina/Buenos_Aires', OCTOBER_2026)).toBe(
      'Argentina · Buenos Aires (UTC-3)',
    )
  })

  it('keeps zones without a region', () => {
    expect(formatTimezoneLabel('UTC', OCTOBER_2026)).toBe('UTC (UTC)')
  })
})

describe('timezoneOptions', () => {
  it('always includes the selected zone', () => {
    const options = timezoneOptions('Etc/GMT+6', OCTOBER_2026)
    expect(options.some((option) => option.value === 'Etc/GMT+6')).toBe(true)
  })
})
