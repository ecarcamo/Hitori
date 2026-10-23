import { useMemo } from 'react'
import { SelectField } from '@/shared/ui'
import { timezoneOptions } from '../domain/timezones'

interface TimezoneFieldProps {
  value: string
  onChange: (timezone: string) => void
}

export function TimezoneField({ value, onChange }: TimezoneFieldProps) {
  const options = useMemo(() => timezoneOptions(value, new Date()), [value])

  return (
    <SelectField
      label="Tu zona horaria"
      hint="Las fechas se guardan en UTC y Hitori te las muestra en esta zona."
      options={options}
      value={value}
      onChange={(event) => {
        onChange(event.target.value)
      }}
    />
  )
}
