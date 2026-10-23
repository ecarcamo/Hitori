import { useMutation } from '@tanstack/react-query'
import { useState, type SubmitEvent } from 'react'
import { Button, PageHeader, TextField } from '@/shared/ui'
import { DISPLAY_NAME_MAX_LENGTH, normalizeDisplayName } from '../domain/profile'
import { useProfile, useUpdateProfile } from '../hooks/profileQueries'
import type { ProfileRepository } from '../repositories/profileRepository'
import styles from './AccountPage.module.css'
import { TimezoneField } from './TimezoneField'

interface AccountPageProps {
  profiles: ProfileRepository
  userId: string
  email: string | null
  onSignOut: () => Promise<void>
}

export function AccountPage({ profiles, userId, email, onSignOut }: AccountPageProps) {
  const profile = useProfile(profiles, userId)
  const updateProfile = useUpdateProfile(profiles, userId)
  const signOut = useMutation({ mutationFn: onSignOut })
  const [displayName, setDisplayName] = useState(profile.displayName ?? '')
  const [timezone, setTimezone] = useState(profile.timezone)

  const hasChanges =
    normalizeDisplayName(displayName) !== profile.displayName || timezone !== profile.timezone

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    updateProfile.mutate({ displayName: normalizeDisplayName(displayName), timezone })
  }

  return (
    <>
      <PageHeader title="Cuenta" description={email ? `Entraste como ${email}.` : undefined} />
      <form className={styles.form} onSubmit={handleSubmit}>
        <TextField
          label="Nombre"
          autoComplete="given-name"
          maxLength={DISPLAY_NAME_MAX_LENGTH}
          value={displayName}
          onChange={(event) => {
            setDisplayName(event.target.value)
          }}
        />
        <TimezoneField value={timezone} onChange={setTimezone} />
        <div className={styles.actions}>
          <Button type="submit" variant="accent" disabled={!hasChanges || updateProfile.isPending}>
            {updateProfile.isPending ? 'Guardando…' : 'Guardar cambios'}
          </Button>
          {updateProfile.isSuccess && !hasChanges ? (
            <span className={styles.status} role="status">
              Guardado
            </span>
          ) : null}
        </div>
        {updateProfile.error ? (
          <p className={styles.error} role="alert">
            {updateProfile.error.message}
          </p>
        ) : null}
      </form>
      <section className={styles.signOut}>
        <h2 className={styles.sectionTitle}>Sesión</h2>
        <Button
          disabled={signOut.isPending}
          onClick={() => {
            signOut.mutate()
          }}
        >
          {signOut.isPending ? 'Cerrando…' : 'Cerrar sesión'}
        </Button>
      </section>
    </>
  )
}
