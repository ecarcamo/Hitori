import { useState, type SubmitEvent } from 'react'
import { BrandMark, Button, TextField } from '@/shared/ui'
import { DISPLAY_NAME_MAX_LENGTH, normalizeDisplayName } from '../domain/profile'
import { getDeviceTimezone } from '../domain/timezones'
import { useProfile, useUpdateProfile } from '../hooks/profileQueries'
import type { ProfileRepository } from '../repositories/profileRepository'
import styles from './OnboardingPage.module.css'
import { TimezoneField } from './TimezoneField'

interface OnboardingPageProps {
  profiles: ProfileRepository
  userId: string
  onDone: () => void
}

export function OnboardingPage({ profiles, userId, onDone }: OnboardingPageProps) {
  const profile = useProfile(profiles, userId)
  const updateProfile = useUpdateProfile(profiles, userId)
  const [displayName, setDisplayName] = useState(profile.displayName ?? '')
  const [timezone, setTimezone] = useState(() => getDeviceTimezone())

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    updateProfile.mutate(
      {
        displayName: normalizeDisplayName(displayName),
        timezone,
        onboardedAt: new Date().toISOString(),
      },
      { onSuccess: onDone },
    )
  }

  return (
    <main className={styles.screen}>
      <form className={styles.panel} onSubmit={handleSubmit}>
        <header className={styles.header}>
          <BrandMark size="lg" />
          <h1 className={styles.title}>Te damos la bienvenida</h1>
          <p className={styles.lead}>Dos datos y empiezas. Puedes cambiarlos cuando quieras.</p>
        </header>
        <TextField
          label="¿Cómo te llamamos?"
          autoComplete="given-name"
          maxLength={DISPLAY_NAME_MAX_LENGTH}
          value={displayName}
          onChange={(event) => {
            setDisplayName(event.target.value)
          }}
        />
        <TimezoneField value={timezone} onChange={setTimezone} />
        <Button type="submit" variant="accent" size="lg" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? 'Guardando…' : 'Empezar'}
        </Button>
        {updateProfile.error ? (
          <p className={styles.error} role="alert">
            {updateProfile.error.message}
          </p>
        ) : null}
      </form>
    </main>
  )
}
