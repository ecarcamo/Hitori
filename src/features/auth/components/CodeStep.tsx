import { useMutation } from '@tanstack/react-query'
import { useState, type SubmitEvent } from 'react'
import { Button, TextField } from '@/shared/ui'
import { authErrorMessage } from '../domain/authError'
import { isCompleteSignInCode, sanitizeSignInCode } from '../domain/credentials'
import { useCooldown } from '../hooks/useCooldown'
import type { AuthRepository } from '../repositories/authRepository'
import styles from './SignInPage.module.css'

const RESEND_COOLDOWN_SECONDS = 60

interface CodeStepProps {
  auth: AuthRepository
  email: string
  onVerified: () => void
  onChangeEmail: () => void
}

export function CodeStep({ auth, email, onVerified, onChangeEmail }: CodeStepProps) {
  const [code, setCode] = useState('')
  const cooldown = useCooldown(RESEND_COOLDOWN_SECONDS)
  const verify = useMutation({
    mutationFn: (value: string) => auth.verifySignInCode(email, value),
    onSuccess: onVerified,
  })
  const resend = useMutation({
    mutationFn: () => auth.sendSignInCode(email),
    onSuccess: () => {
      setCode('')
      verify.reset()
      cooldown.restart()
    },
  })

  const submitIfComplete = (value: string) => {
    if (isCompleteSignInCode(value) && !verify.isPending) {
      verify.mutate(value)
    }
  }

  const handleChange = (value: string) => {
    const sanitized = sanitizeSignInCode(value)
    setCode(sanitized)
    submitIfComplete(sanitized)
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    submitIfComplete(code)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <p className={styles.lead}>
        Te mandamos un código a <b>{email}</b>. Vence en 10 minutos.
      </p>
      <TextField
        label="Código"
        autoComplete="one-time-code"
        inputMode="numeric"
        className={styles.codeInput}
        value={code}
        autoFocus
        onChange={(event) => {
          handleChange(event.target.value)
        }}
        error={verify.error ? authErrorMessage(verify.error) : undefined}
      />
      <Button
        type="submit"
        variant="accent"
        size="lg"
        disabled={!isCompleteSignInCode(code) || verify.isPending}
      >
        {verify.isPending ? 'Entrando…' : 'Entrar'}
      </Button>
      <div className={styles.secondaryActions}>
        <Button
          variant="ghost"
          size="sm"
          disabled={cooldown.remaining > 0 || resend.isPending}
          onClick={() => {
            resend.mutate()
          }}
        >
          {cooldown.remaining > 0
            ? `Reenviar en ${String(cooldown.remaining)} s`
            : 'Reenviar código'}
        </Button>
        <Button variant="ghost" size="sm" onClick={onChangeEmail}>
          Usar otro correo
        </Button>
      </div>
      {resend.error ? (
        <p className={styles.error} role="alert">
          {authErrorMessage(resend.error)}
        </p>
      ) : null}
    </form>
  )
}
